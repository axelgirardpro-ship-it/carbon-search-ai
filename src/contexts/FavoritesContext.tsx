import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmissionFactor } from '@/types/emission-factor';

interface FavoritesContextType {
  favorites: EmissionFactor[];
  loading: boolean;
  addToFavorites: (item: EmissionFactor) => Promise<void>;
  removeFromFavorites: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      
      // Get all favorites with their stored data
      const { data: favoritesData, error: favError } = await supabase
        .from('favorites')
        .select('item_id, item_data, created_at')
        .eq('user_id', user.id)
        .eq('item_type', 'emission_factor');

      if (favError) throw favError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Separate UUID and non-UUID item IDs
      const uuidIds: string[] = [];
      const nonUuidFavorites: any[] = [];
      
      favoritesData.forEach(fav => {
        // Check if item_id looks like a UUID
        if (fav.item_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          uuidIds.push(fav.item_id);
        } else {
          // Use stored item_data for non-UUID favorites
          if (fav.item_data) {
            nonUuidFavorites.push({
              ...(fav.item_data as any),
              id: fav.item_id,
              isFavorite: true
            });
          }
        }
      });

      let currentData: any[] = [];
      
      // Only query emission_factors for valid UUIDs
      if (uuidIds.length > 0) {
        const { data, error: emissionError } = await supabase
          .from('emission_factors')
          .select('*')
          .in('id', uuidIds);

        if (emissionError) {
          console.error('Error fetching emission factors:', emissionError);
        } else {
          currentData = data || [];
        }
      }

      // For UUID favorites, use current data if available, otherwise fall back to stored data
      const uuidFavorites = favoritesData
        .filter(fav => uuidIds.includes(fav.item_id))
        .map(fav => {
          const currentItem = currentData.find(item => item.id === fav.item_id);
          
          if (currentItem) {
            // Update stored data with current data
            supabase
              .from('favorites')
              .update({ item_data: currentItem })
              .eq('user_id', user.id)
              .eq('item_id', fav.item_id);
              
            return {
              ...currentItem,
              isFavorite: true
            };
          } else if (fav.item_data) {
            // Fall back to stored data if current data not found
            return {
              ...(fav.item_data as any),
              id: fav.item_id,
              isFavorite: true
            };
          }
          return null;
        })
        .filter(Boolean);

      // Combine all favorites
      const allFavorites = [...nonUuidFavorites, ...uuidFavorites] as EmissionFactor[];
      
      setFavorites(allFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (item: EmissionFactor) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          item_type: 'emission_factor',
          item_id: item.id,
          item_data: item as any
        });

      if (error) throw error;
      setFavorites(prev => [...prev, item]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) throw error;

      setFavorites(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId);
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      refreshFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
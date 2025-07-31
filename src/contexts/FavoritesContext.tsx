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
      console.log('🚀 FavoritesContext: No user, clearing favorites');
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 FavoritesContext: Fetching favorites for user:', user.id);
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      console.log('🚀 FavoritesContext: Raw favorites data:', data);
      console.log('🚀 FavoritesContext: Error:', error);

      if (error) throw error;

      // Convert favorites data back to EmissionFactor format
      const favoritesData = data.map(fav => {
        const itemData = fav.item_data as any;
        return {
          ...itemData,
          id: fav.item_id
        };
      }) as EmissionFactor[];

      console.log('🚀 FavoritesContext: Processed favorites:', favoritesData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (item: EmissionFactor) => {
    if (!user) {
      console.log('🚀 FavoritesContext: No user, cannot add favorite');
      return;
    }

    try {
      console.log('🚀 FavoritesContext: Adding to favorites:', item);
      
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          item_type: 'emission_factor',
          item_id: item.id,
          item_data: item as any
        });

      console.log('🚀 FavoritesContext: Insert result, error:', error);

      if (error) throw error;

      setFavorites(prev => [...prev, item]);
      console.log('🚀 FavoritesContext: Added to local favorites, new count:', favorites.length + 1);
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
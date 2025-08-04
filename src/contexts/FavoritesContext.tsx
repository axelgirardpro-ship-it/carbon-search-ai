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
      
      // Get favorites with their IDs
      const { data: favoritesData, error: favError } = await supabase
        .from('favorites')
        .select('item_id, created_at')
        .eq('user_id', user.id)
        .eq('item_type', 'emission_factor');

      if (favError) throw favError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Get current emission factors data for these IDs
      const itemIds = favoritesData.map(fav => fav.item_id);
      const { data: currentData, error: emissionError } = await supabase
        .from('emission_factors')
        .select('*')
        .in('id', itemIds);

      if (emissionError) throw emissionError;

      // Convert to EmissionFactor format and mark as favorites
      const updatedFavorites = (currentData || []).map(item => ({
        ...item,
        isFavorite: true
      })) as EmissionFactor[];

      // Update the favorites table with current data
      const updatePromises = updatedFavorites.map(item => 
        supabase
          .from('favorites')
          .update({ item_data: item as any })
          .eq('user_id', user.id)
          .eq('item_id', item.id)
      );

      await Promise.all(updatePromises);

      setFavorites(updatedFavorites);
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
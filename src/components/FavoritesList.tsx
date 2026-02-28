import React from 'react';
import { MenuItem } from '../lib/gemini';
import { MenuItemCard } from './MenuItemCard';
import { UserDietaryProfile } from './DietaryProfileSelector';

interface FavoritesListProps {
  favorites: MenuItem[];
  onToggleFavorite: (item: MenuItem) => void;
  dietaryProfile: UserDietaryProfile;
}

export function FavoritesList({ favorites, onToggleFavorite, dietaryProfile }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white/50 rounded-3xl border border-slate-200">
        <p className="text-xl font-medium">No favorites yet. ❤️</p>
        <p className="text-sm mt-2">Save dishes you love to find them later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
      {favorites.map((item, index) => (
        <MenuItemCard
          key={index}
          item={item}
          isFavorite={true}
          onToggleFavorite={() => onToggleFavorite(item)}
          dietaryProfile={dietaryProfile}
          onViewInsights={() => {}} // Placeholder for now, or we could lift state
        />
      ))}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { MenuItem } from '../lib/gemini';
import { MenuItemCard } from './MenuItemCard';
import { UserDietaryProfile } from './DietaryProfileSelector';
import { DishInsightsModal } from './DishInsightsModal';

interface MenuResultsProps {
  items: MenuItem[];
  favorites: MenuItem[];
  onToggleFavorite: (item: MenuItem) => void;
  dietaryProfile: UserDietaryProfile;
}

export function MenuResults({ items, favorites, onToggleFavorite, dietaryProfile }: MenuResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItemForInsights, setSelectedItemForInsights] = useState<MenuItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <>
      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {filteredItems.map((item, index) => {
          const isFavorite = favorites.some((fav) => fav.original === item.original);
          return (
            <MenuItemCard
              key={index}
              item={item}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(item)}
              dietaryProfile={dietaryProfile}
              onViewInsights={() => setSelectedItemForInsights(item)}
            />
          );
        })}
      </div>

      {/* Insights Modal */}
      {selectedItemForInsights && (
        <DishInsightsModal
          item={selectedItemForInsights}
          isOpen={!!selectedItemForInsights}
          onClose={() => setSelectedItemForInsights(null)}
        />
      )}
    </>
  );
}

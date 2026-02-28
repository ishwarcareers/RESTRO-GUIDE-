import React from 'react';
import { Heart, Info, Video, Loader2, Search, CheckCircle, AlertTriangle, XCircle, Volume2 } from 'lucide-react';
import { MenuItem } from '../lib/gemini';
import { motion } from 'motion/react';
import { UserDietaryProfile } from './DietaryProfileSelector';

interface MenuItemCardProps {
  item: MenuItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  dietaryProfile: UserDietaryProfile;
  onViewInsights: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, isFavorite, onToggleFavorite, dietaryProfile, onViewInsights }) => {
  
  // Calculate Dietary Match Score
  const getMatchStatus = () => {
    let score = 0;
    let warnings: string[] = [];
    let isSafe = true;

    if (dietaryProfile.isVegetarian && !item.dietary.includes('Vegetarian') && !item.dietary.includes('Vegan')) {
      isSafe = false;
      warnings.push('Not Vegetarian');
    }
    if (dietaryProfile.isVegan && !item.dietary.includes('Vegan')) {
      isSafe = false;
      warnings.push('Not Vegan');
    }
    if (dietaryProfile.isGlutenFree && !item.dietary.includes('Gluten-Free')) {
      isSafe = false;
      warnings.push('Contains Gluten');
    }
    if (dietaryProfile.hasNutAllergy && item.allergens.includes('nuts')) {
      isSafe = false;
      warnings.push('Contains Nuts');
    }
    if (dietaryProfile.hasDairyAllergy && item.allergens.includes('dairy')) {
      isSafe = false;
      warnings.push('Contains Dairy');
    }

    return { isSafe, warnings };
  };

  const { isSafe, warnings } = getMatchStatus();

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${item.translated}. ${item.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 ${
        isSafe ? 'border-l-emerald-500' : 'border-l-red-500'
      }`}
    >
      <div className="p-6 relative">
        {/* Match Badge */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isSafe ? (
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <CheckCircle size={14} /> 100% Match
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <AlertTriangle size={14} /> {warnings[0]}
            </div>
          )}
        </div>

        <div className="flex justify-between items-start mb-4 pr-24">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{item.translated}</h3>
            <p className="text-sm text-gray-500 italic font-serif">{item.original}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
            {item.category}
          </span>
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
            {item.price}
          </span>
          {item.spiceLevel !== 'Mild' && (
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100 flex items-center gap-1">
              🌶️ {item.spiceLevel}
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{item.description}</p>

        {/* Dietary & Allergens */}
        <div className="flex flex-wrap gap-2 mb-6">
          {item.dietary.map((d, i) => (
            <span key={i} className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
              {d}
            </span>
          ))}
          {item.allergens.map((a, i) => (
            <span key={i} className="text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
              Contains {a}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-100 pt-4 mt-auto">
          <button 
            onClick={handleReadAloud}
            className="p-2.5 rounded-xl transition-all border bg-white text-gray-400 border-gray-200 hover:border-purple-200 hover:text-purple-500 hover:bg-purple-50"
            title="Read Aloud"
          >
            <Volume2 size={20} />
          </button>

          <button 
            onClick={onViewInsights}
            className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Info size={16} /> View Insights
          </button>
          
          <button 
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-xl transition-all border ${
              isFavorite 
                ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
                : 'bg-white text-gray-400 border-gray-200 hover:border-red-200 hover:text-red-400'
            }`}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

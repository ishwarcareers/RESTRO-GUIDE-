import React from 'react';
import { Check, Leaf, WheatOff, MilkOff, NutOff } from 'lucide-react';

export interface UserDietaryProfile {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  hasNutAllergy: boolean;
  hasDairyAllergy: boolean;
}

interface DietaryProfileSelectorProps {
  profile: UserDietaryProfile;
  onChange: (profile: UserDietaryProfile) => void;
}

export function DietaryProfileSelector({ profile, onChange }: DietaryProfileSelectorProps) {
  const toggle = (key: keyof UserDietaryProfile) => {
    onChange({ ...profile, [key]: !profile[key] });
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => toggle('isVegetarian')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            profile.isVegetarian 
              ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Leaf size={16} /> Vegetarian
        </button>
        <button
          onClick={() => toggle('isVegan')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            profile.isVegan 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Leaf size={16} /> Vegan
        </button>
        <button
          onClick={() => toggle('isGlutenFree')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            profile.isGlutenFree 
              ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <WheatOff size={16} /> Gluten-Free
        </button>
        <button
          onClick={() => toggle('hasNutAllergy')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            profile.hasNutAllergy 
              ? 'bg-red-100 text-red-700 border-red-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <NutOff size={16} /> Nut Allergy
        </button>
        <button
          onClick={() => toggle('hasDairyAllergy')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
            profile.hasDairyAllergy 
              ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <MilkOff size={16} /> Dairy Allergy
        </button>
      </div>
    </div>
  );
}

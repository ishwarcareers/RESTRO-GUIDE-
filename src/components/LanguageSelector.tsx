import React from 'react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (lang: string) => void;
}

const languages = [
  { code: 'English', flag: '🇬🇧' },
  { code: 'Spanish', flag: '🇪🇸' },
  { code: 'French', flag: '🇫🇷' },
  { code: 'German', flag: '🇩🇪' },
  { code: 'Hindi', flag: '🇮🇳' },
  { code: 'Chinese', flag: '🇨🇳' },
  { code: 'Japanese', flag: '🇯🇵' },
  { code: 'Korean', flag: '🇰🇷' },
  { code: 'Arabic', flag: '🇸🇦' },
  { code: 'Italian', flag: '🇮🇹' },
];

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border ${
            selectedLanguage === lang.code
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm transform scale-105 font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className="text-xl">{lang.flag}</span>
          <span>{lang.code}</span>
        </button>
      ))}
    </div>
  );
}

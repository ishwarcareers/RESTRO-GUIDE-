import React, { useState, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { ImageUploader } from './components/ImageUploader';
import { MenuResults } from './components/MenuResults';
import { FavoritesList } from './components/FavoritesList';
import { MenuItem, analyzeMenu, enhanceImage } from './lib/gemini';
import { Loader2, Heart, Sparkles, Edit2, X, History, LogIn, LogOut, User as UserIcon, WifiOff, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DietaryProfileSelector, UserDietaryProfile } from './components/DietaryProfileSelector';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryView } from './components/HistoryView';
import { savePendingScan, getPendingScans, removePendingScan, PendingScan } from './lib/storage';

function MainApp() {
  const { user, login, logout } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingScans, setPendingScans] = useState<PendingScan[]>([]);
  
  // Dietary Profile State
  const [dietaryProfile, setDietaryProfile] = useState<UserDietaryProfile>({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    hasNutAllergy: false,
    hasDairyAllergy: false,
  });
  
  // Image Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('menuLensFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
    setPendingScans(getPendingScans());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveFavorites = (newFavorites: MenuItem[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('menuLensFavorites', JSON.stringify(newFavorites));
  };

  const handleToggleFavorite = (item: MenuItem) => {
    const exists = favorites.some(fav => fav.original === item.original);
    if (exists) {
      saveFavorites(favorites.filter(fav => fav.original !== item.original));
    } else {
      saveFavorites([...favorites, item]);
    }
  };

  const handleTranslate = async () => {
    if (!selectedImage) return;

    if (!isOnline) {
      savePendingScan(selectedImage);
      setPendingScans(getPendingScans());
      handleClear();
      alert("You are offline. Scan saved to 'Pending Uploads'.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const items = await analyzeMenu(selectedImage, selectedLanguage);
      setMenuItems(items);

      // Save to History if logged in
      if (user) {
        const summary = items.length > 0 ? items[0].translated : "Menu Scan";
        const originalSummary = items.length > 0 ? items[0].original : "Original Menu";
        
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            originalText: originalSummary,
            translatedText: summary,
            imageData: selectedImage 
          })
        });
      }

    } catch (err) {
      setError('Failed to translate menu. Please try again or check your API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPending = (scan: PendingScan) => {
    setSelectedImage(scan.imageData);
    removePendingScan(scan.id);
    setPendingScans(getPendingScans());
  };

  const handleEnhanceImage = async () => {
    if (!selectedImage || !editPrompt) return;
    setIsEnhancing(true);
    try {
      const enhancedBase64 = await enhanceImage(selectedImage, editPrompt);
      setSelectedImage(enhancedBase64);
      setIsEditing(false);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      alert('Failed to edit image');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setMenuItems([]);
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded shadow-sm flex items-center gap-2">
            <WifiOff size={20} />
            <p className="font-medium">You are currently offline. Translations are disabled, but you can save scans for later.</p>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <span className="text-2xl text-white">🍽️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Restro Guide</h1>
              <p className="text-slate-500 text-sm font-medium">Your Culinary Translator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="hidden md:block text-sm font-medium text-slate-700">
                    {user.name}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowHistory(true)}
                  className="p-3 rounded-full bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
                  title="View History"
                >
                  <History size={20} />
                </button>
                
                <button
                  onClick={logout}
                  className="p-3 rounded-full bg-white text-red-500 hover:bg-red-50 border border-slate-200 transition-colors shadow-sm"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogIn size={18} /> Sign In
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all border ${
                showFavorites 
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-inner' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-500 shadow-sm'
              }`}
            >
              <Heart size={20} fill={showFavorites ? "currentColor" : "none"} />
              <span className="hidden md:inline">Favorites ({favorites.length})</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {showHistory && (
            <HistoryView onClose={() => setShowHistory(false)} onSelect={(item) => {}} />
          )}

          {showFavorites ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => setShowFavorites(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  &larr; Back to Translator
                </button>
                <h2 className="text-2xl font-bold text-slate-900">Your Saved Dishes</h2>
              </div>
              <FavoritesList 
                favorites={favorites} 
                onToggleFavorite={handleToggleFavorite} 
                dietaryProfile={dietaryProfile}
              />
            </motion.div>
          ) : (
            <motion.div
              key="translator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Controls */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Pending Scans Widget */}
                  {pendingScans.length > 0 && isOnline && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 sticky top-4">
                      <h3 className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CloudUpload size={16} /> Pending Uploads
                      </h3>
                      <div className="space-y-3">
                        {pendingScans.map(scan => (
                          <div key={scan.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <img src={`data:image/jpeg;base64,${scan.imageData}`} className="w-12 h-12 object-cover rounded-lg" alt="Scan" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500">{new Date(scan.timestamp).toLocaleTimeString()}</p>
                              <p className="text-sm font-medium text-slate-700 truncate">Saved Scan</p>
                            </div>
                            <button 
                              onClick={() => handleProcessPending(scan)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                            >
                              Load
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-32">
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Configuration</h2>
                    
                    {/* Language Selector */}
                    <section className="mb-8">
                      <label className="block text-slate-700 text-sm font-semibold mb-3">Target Language</label>
                      <LanguageSelector selectedLanguage={selectedLanguage} onSelect={setSelectedLanguage} />
                    </section>

                    {/* Dietary Profile Selector */}
                    <section>
                      <label className="block text-slate-700 text-sm font-semibold mb-3">Dietary Preferences</label>
                      <DietaryProfileSelector profile={dietaryProfile} onChange={setDietaryProfile} />
                    </section>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Upload Section */}
                  <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                    <ImageUploader 
                      selectedImage={selectedImage} 
                      onImageSelect={setSelectedImage} 
                      onClear={handleClear} 
                    />

                    {/* Image Actions */}
                    {selectedImage && !menuItems.length && (
                      <div className="flex flex-col items-center gap-4 w-full max-w-md mt-6">
                        {/* Edit Image Toggle */}
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm transition-colors font-medium"
                          >
                            <Edit2 size={16} /> Edit / Enhance Photo
                          </button>
                        ) : (
                          <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-slate-700 text-sm font-medium">Edit Prompt</label>
                              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="e.g., 'Make it brighter', 'Remove background'"
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                              <button
                                onClick={handleEnhanceImage}
                                disabled={isEnhancing || !editPrompt}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                              >
                                {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleTranslate}
                          disabled={isLoading}
                          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:-translate-y-1 ${
                            isOnline 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin" /> Translating Menu...
                            </>
                          ) : !isOnline ? (
                            <>
                              <CloudUpload className="fill-white/20" /> Save Scan for Later
                            </>
                          ) : (
                            <>
                              <Sparkles className="fill-white/20" /> Translate Menu
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </section>

                  {/* Results Section */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-center font-medium animate-in fade-in slide-in-from-bottom-4">
                      {error}
                    </div>
                  )}

                  {menuItems.length > 0 && (
                    <MenuResults 
                      items={menuItems} 
                      favorites={favorites} 
                      onToggleFavorite={handleToggleFavorite}
                      dietaryProfile={dietaryProfile}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

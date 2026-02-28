import React, { useState, useEffect } from 'react';
import { MenuItem, generateDishVideo, searchDishInfo } from '../lib/gemini';
import { X, Loader2, Video, Search, Globe, MapPin, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DishInsightsModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DishInsightsModal({ item, isOpen, onClose }: DishInsightsModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualize' | 'context'>('context');

  // Reset state when item changes
  useEffect(() => {
    setVideoUrl(null);
    setSearchInfo(null);
    if (isOpen) {
      handleSearchInfo(); // Auto-load context on open
    }
  }, [item, isOpen]);

  const handleGenerateVideo = async () => {
    if (videoUrl || isVideoLoading) return;
    setIsVideoLoading(true);
    try {
      const url = await generateDishVideo(`Cinematic shot of ${item.translated}, ${item.description}. Professional food photography, 4k, highly detailed.`);
      setVideoUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleSearchInfo = async () => {
    if (searchInfo || isSearchLoading) return;
    setIsSearchLoading(true);
    try {
      const info = await searchDishInfo(item.original);
      setSearchInfo(info);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.translated}</h2>
              <p className="text-gray-500 font-serif italic">{item.original}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('context')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'context' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Globe size={16} /> Cultural Insights
            </button>
            <button
              onClick={() => setActiveTab('visualize')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'visualize' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Video size={16} /> Visual Experience
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'context' && (
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                    <History size={16} /> Origins & History
                  </h4>
                  {isSearchLoading ? (
                    <div className="flex items-center gap-2 text-amber-700/60 text-sm">
                      <Loader2 size={14} className="animate-spin" /> Researching cultural context...
                    </div>
                  ) : (
                    <p className="text-amber-900/80 text-sm leading-relaxed">
                      {searchInfo || "No historical data found."}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={16} /> Ingredients Breakdown
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm border border-gray-200">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visualize' && (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {videoUrl ? (
                  <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-black">
                    <video src={videoUrl} controls autoPlay loop className="w-full aspect-video object-cover" />
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 w-full">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">See it before you order</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Generate a cinematic AI video of this dish to understand its presentation and texture.
                    </p>
                    <button
                      onClick={handleGenerateVideo}
                      disabled={isVideoLoading}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2 mx-auto"
                    >
                      {isVideoLoading ? <Loader2 className="animate-spin" /> : <Video size={18} />}
                      {isVideoLoading ? 'Generating Video...' : 'Generate Preview'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

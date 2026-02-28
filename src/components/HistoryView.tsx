import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Calendar, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../lib/gemini';

interface HistoryItem {
  id: number;
  original_text: string;
  translated_text: string;
  image_data: string;
  created_at: string;
}

interface HistoryViewProps {
  onClose: () => void;
  onSelect: (item: MenuItem) => void;
}

export function HistoryView({ onClose, onSelect }: HistoryViewProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col"
    >
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Your Dining History</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No history found. Start scanning menus!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => {
              // Parse the stored JSON strings back to objects if needed, 
              // or construct a MenuItem-like object for display
              // Note: The DB stores strings. We need to be careful about format.
              // For now, we just display the raw text or basic info.
              
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    <img src={item.image_data} alt="Menu Scan" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-xs font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.translated_text}</h3>
                    <p className="text-sm text-gray-500 italic mb-3 line-clamp-1">{item.original_text}</p>
                    <button 
                      className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        // Reconstruct a partial MenuItem to view
                        // Ideally we'd store the full JSON, but for this demo we'll just show what we have
                        alert("Viewing full details from history is a future feature! For now, enjoy the summary.");
                      }}
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

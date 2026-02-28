import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  onClear: () => void;
  selectedImage: string | null;
}

export function ImageUploader({ onImageSelect, onClear, selectedImage }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix for API
      const base64Data = base64.split(',')[1];
      onImageSelect(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
          <img 
            src={`data:image/jpeg;base64,${selectedImage}`} 
            alt="Menu Preview" 
            className="w-full h-64 sm:h-96 object-cover"
          />
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg"
          >
            <X size={24} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : 'border-slate-200 hover:border-blue-300 bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center gap-4 text-slate-600">
            <div className="p-6 bg-white rounded-full shadow-sm border border-slate-100">
              <UploadCloud size={48} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Upload Menu Photo</h3>
              <p className="text-slate-500 mt-1">Drag & drop or choose an option</p>
            </div>
            
            <div className="flex gap-4 mt-6 w-full justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <ImageIcon size={20} />
                Gallery
              </button>
              <button
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <Camera size={20} />
                Camera
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}

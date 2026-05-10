import React, { useRef, useState } from 'react';
import { Upload, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative group cursor-pointer
              aspect-video border-2 border-dashed rounded-2xl
              flex flex-col items-center justify-center gap-4
              transition-all duration-300 ease-out
              ${isDragging 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }
            `}
            id="upload-dropzone"
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
              id="video-input"
            />
            <div className={`
              p-4 rounded-full bg-white/5 transition-transform duration-300
              ${isDragging ? 'scale-110' : 'group-hover:scale-105'}
            `} id="icon-container">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-orange-500' : 'text-white/40'}`} id="upload-icon" />
            </div>
            <div className="text-center" id="text-container">
              <p className="text-lg font-medium text-white/90" id="upload-main-text">Click or drag video to analyze</p>
              <p className="text-sm text-white/40 mt-1" id="upload-sub-text">MP4, MOV or WebM (Max 20MB)</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10"
            id="video-preview-container"
          >
            <video
              src={URL.createObjectURL(selectedFile)}
              className="w-full h-full object-contain"
              controls
              id="preview-video-element"
            />
            <button
              onClick={onClear}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors"
              title="Remove video"
              id="remove-video-btn"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg backdrop-blur-sm border border-white/10" id="file-info">
              <Video className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white/80 font-mono tracking-tight" id="file-name">{selectedFile.name}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

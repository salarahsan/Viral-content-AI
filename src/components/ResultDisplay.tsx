import React, { useState } from 'react';
import { Copy, Check, TrendingUp, FileText, Hash, Share2, Send } from 'lucide-react';
import { motion } from 'motion/react';
import type { ViralResult } from '../services/gemini';

interface ResultDisplayProps {
  result: ViralResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(id);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const shareToTikTok = async () => {
    const title = result.titles[0];
    const hashtags = result.tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    const shareText = `${title}\n\n${result.description}\n\n${hashtags}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Viral Video Plan',
          text: shareText,
        });
      } catch (err) {
        handleCopy(shareText, 'tiktok-bundle');
      }
    } else {
      handleCopy(shareText, 'tiktok-bundle');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 mt-12 mb-24" id="results-container">
      {/* Quick Action Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl" id="tiktok-share-panel">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">Ready for TikTok?</h3>
            <p className="text-white/60 text-sm">One-click copy for the ultimate viral post.</p>
          </div>
        </div>
        <button
          onClick={shareToTikTok}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-orange-50 transition-colors active:scale-95"
          id="copy-tiktok-bundle-btn"
        >
          {copiedValue === 'tiktok-bundle' ? (
            <><Check className="w-4 h-4 text-green-600" /> Copied Bundle</>
          ) : (
            <><Send className="w-4 h-4" /> Copy TikTok Pack</>
          )}
        </button>
      </section>

      {/* Titles Section */}
      <section className="space-y-4" id="titles-section">
        <div className="flex items-center gap-3 px-2" id="titles-header">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-medium text-white tracking-tight">Viral Titles</h2>
        </div>
        <div className="grid gap-3" id="titles-grid">
          {result.titles.map((title, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/[0.07] transition-all"
              id={`title-card-${idx}`}
            >
              <p className="text-white/90 text-lg font-medium pr-12 leading-snug" id={`title-text-${idx}`}>{title}</p>
              <button
                onClick={() => handleCopy(title, `title-${idx}`)}
                className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-white/40 hover:text-orange-500 transition-colors"
                id={`copy-title-${idx}`}
              >
                {copiedValue === `title-${idx}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Description Section */}
      <section className="space-y-4" id="description-section">
        <div className="flex items-center gap-3 px-2" id="description-header">
          <FileText className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-medium text-white tracking-tight">SEO Description</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/[0.07] transition-all"
          id="description-card"
        >
          <div className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed pr-10" id="description-text">
            {result.description}
          </div>
          <button
            onClick={() => handleCopy(result.description, 'description')}
            className="absolute top-6 right-6 p-2 text-white/40 hover:text-orange-500 transition-colors"
            id="copy-description"
          >
            {copiedValue === 'description' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </motion.div>
      </section>

      {/* Tags Section */}
      <section className="space-y-4" id="tags-section">
        <div className="flex items-center gap-3 px-2" id="tags-header">
          <Hash className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-medium text-white tracking-tight">Trending Hashtags</h2>
        </div>
        <div className="flex flex-wrap gap-2" id="tags-container">
          {result.tags.map((tag, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-sm font-medium"
              id={`tag-${idx}`}
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </motion.span>
          ))}
        </div>
      </section>
    </div>
  );
};

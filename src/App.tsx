import { useState, useEffect, MouseEvent } from 'react';
import { Sparkles, Loader2, Play, History as HistoryIcon, Clock, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadZone } from './components/UploadZone';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeVideo, type ViralResult } from './services/gemini';

interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  result: ViralResult;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('viral_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load history', err);
      }
    }
  }, []);

  const saveToHistory = (fileName: string, newResult: ViralResult) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      fileName,
      result: newResult
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('viral_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('viral_history', JSON.stringify(updated));
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit. Please choose a smaller video.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setKeywords('');
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setKeywords('');
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const output = await analyzeVideo(base64, file.type, keywords);
      setResult(output);
      saveToHistory(file.name, output);
    } catch (err: any) {
      console.error(err);
      setError('Failed to analyze video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setFile(null);
    setShowHistory(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans overflow-x-hidden">
      {/* Background Decor - Enhancing with more "lighty" elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/15 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[140px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[30%] bg-blue-500/5 blur-[160px] rounded-full rotate-45" />
        {/* Subtle grid for detail */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent:70%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Nav / Overlay Buttons */}
        <div className="absolute top-8 right-6 z-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all shadow-lg backdrop-blur-md"
            id="toggle-history-btn"
          >
            <HistoryIcon className="w-4 h-4" />
            {showHistory ? 'Close History' : 'Recent Analysis'}
          </button>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 transition-all"
              />
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed top-24 right-6 bottom-8 w-80 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl z-30 overflow-hidden shadow-2xl flex flex-col"
                id="history-panel"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Your History
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-white/20 text-sm">
                      <HistoryIcon className="w-8 h-8 mb-2 opacity-50" />
                      No previous analysis found
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group p-3 bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-xl cursor-pointer transition-all hover:bg-white/[0.08]"
                        id={`history-item-${item.id}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] text-orange-500 font-mono uppercase">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-white/80 line-clamp-1 mb-2">{item.fileName}</p>
                        <div className="flex items-center text-[10px] text-white/30 font-medium">
                          View Results <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="text-center mb-16 space-y-4" id="app-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-500 tracking-widest uppercase mb-4"
            id="badge"
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Virality
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6"
            id="main-title"
          >
            Go Viral on <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">Auto-Pilot</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto"
            id="sub-title"
          >
            Upload your video and get high-conversion titles in English, Hindi, or Urdu.
            Optimized for YouTube and TikTok algorithms.
          </motion.p>
        </header>

        {/* Content */}
        <div className="space-y-12" id="main-content">
          <UploadZone
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onClear={handleClear}
          />

          <AnimatePresence>
            {file && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto w-full space-y-3"
                id="keywords-container"
              >
                <label htmlFor="keywords-input" className="text-sm font-medium text-white/60 ml-1">
                  Focus keywords or themes (optional)
                </label>
                <input
                  id="keywords-input"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. brutalist architecture, rapid cuts, lo-fi aesthetic"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-red-400 font-medium bg-red-500/10 border border-red-500/20 py-3 rounded-lg max-w-md mx-auto"
                id="error-message"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex justify-center" id="action-area">
            <button
              onClick={handleGenerate}
              disabled={!file || loading}
              className={`
                relative group flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300
                ${!file || loading 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] active:scale-95'
                }
              `}
              id="generate-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Trends...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Generate Viral Hook
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={JSON.stringify(result)}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <ResultDisplay result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 text-center" id="app-footer">
          <p className="text-white/20 text-sm hover:text-white/40 transition-colors cursor-default" id="footer-text">
            Built by <span className="text-orange-500/50 font-medium hover:text-orange-500 transition-colors">Salar</span> • Powered by Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}


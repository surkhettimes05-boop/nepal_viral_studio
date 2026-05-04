/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { 
  TrendingUp, 
  Zap, 
  Camera, 
  MessageSquare, 
  Clock, 
  Share2, 
  RefreshCcw, 
  Flame,
  ChevronRight,
  AlertTriangle,
  Play,
  Clipboard,
  Check,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { geminiService, GeneratedNews, TikTokPackage } from './services/geminiService';

export default function App() {
  const [stories, setStories] = useState<GeneratedNews[]>([]);
  const [selectedStory, setSelectedStory] = useState<GeneratedNews | null>(null);
  const [pkg, setPkg] = useState<TikTokPackage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialTrends();
  }, []);

  const fetchInitialTrends = async () => {
    setIsFetchingTrends(true);
    try {
      const news = await geminiService.fetchLatestTrends();
      setStories(news);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      // Adding a small delay to ensure styles are calculated
      await new Promise(resolve => setTimeout(resolve, 100));

      const blob = await htmlToImage.toBlob(previewRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Increased quality for TikTok
        backgroundColor: '#000000', // Ensure a solid background if one isn't inherited
      });
      
      if (!blob) {
        throw new Error('Image generation resulted in empty blob');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `nano-news-${selectedStory?.id || 'viral'}.png`;
      link.href = url;
      document.body.appendChild(link); // Append for mobile browser compatibility
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Image download successful');
    } catch (err) {
      console.error('Failed to download image:', err);
      // Fallback or user notification could go here
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePackage = async (story: GeneratedNews) => {
    setIsGenerating(true);
    setSelectedStory(story);
    setPkg(null); // Clear previous package
    
    try {
      const result = await geminiService.generateTikTokPackage(story);
      setPkg(result);
    } catch (error) {
      console.error("Failed to generate package:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-[#FE2C55] selection:text-white flex flex-col">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FE2C55] rounded-full flex items-center justify-center shadow-lg shadow-[#FE2C55]/20">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              NEPAL <span className="text-[#25F4EE]">VIRAL</span> STUDIO
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Grounding: Gemini Search Live</span>
            </div>
            <button 
              onClick={fetchInitialTrends}
              disabled={isFetchingTrends}
              className="bg-[#FE2C55] hover:bg-[#ff4065] px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#FE2C55]/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isFetchingTrends ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              REFRESH TRENDS
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Trending Feed */}
        <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <span className="text-red-500">🔥</span> LIVE AI-VERIFIED TRENDS
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">MAY 4, 2026</span>
          </div>
          
          <div className="space-y-3">
            {isFetchingTrends ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
              ))
            ) : (
              stories.map((story) => (
                <motion.button
                  key={story.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generatePackage(story)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedStory?.id === story.id 
                      ? 'bg-slate-900 border-l-4 border-[#FE2C55] border-y border-r border-slate-700 shadow-xl' 
                      : 'bg-slate-900/50 border-slate-800 opacity-80 hover:opacity-100 hover:bg-slate-900'
                  }`}
                >
                  <p className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>{story.source}</span>
                    <span className="text-slate-600">{story.publishedAt}</span>
                  </p>
                  <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 tracking-tight">
                    {story.headline}
                  </h3>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                    story.category === 'Politics' ? 'text-blue-400' :
                    story.category === 'Tragedy' ? 'text-red-400' :
                    story.category === 'Bizarre' ? 'text-yellow-400' :
                    'text-[#25F4EE]'
                  }`}>
                    {story.reason}
                  </p>
                </motion.button>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Viral Package Designer */}
        <section className="lg:col-span-8 flex flex-col gap-6 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
          {!selectedStory ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700 animate-pulse">
                <Play className="w-10 h-10 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Ready to dominate TikTok?</h3>
                <p className="text-slate-400 max-w-sm mx-auto text-sm">
                  Select a trending story from the feed to generate a high-performance viral package tuned for Gen-Z audiences.
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#FE2C55]/20 border-t-[#FE2C55] rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter animate-pulse">Analyzing Virality...</h3>
              <p className="text-slate-400 text-sm mt-2 font-mono">Cross-referencing X, TikTok & Reddit trends</p>
            </div>
          ) : pkg && (
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full gap-6"
              >
                {/* Header Stats */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">URGENT</span>
                    <h2 className="text-3xl font-black mt-1 text-[#25F4EE] tracking-tighter uppercase italic">
                      TikTok Viral Package: {selectedStory.headline.split(' ').slice(0, 3).join(' ')}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-[#FE2C55] tracking-tighter">
                      {pkg.viralScore.toFixed(1)}<span className="text-sm text-slate-500 ml-1">/10</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Viral Potential</div>
                  </div>
                </div>

                {/* News Description & Link */}
                <div className="bg-[#FE2C55]/5 border border-[#FE2C55]/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-[#FE2C55] uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      STORY CONTEXT
                    </h4>
                    <div className="flex items-center gap-3">
                      <a 
                        href={selectedStory.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] text-[#25F4EE] hover:underline flex items-center gap-1 font-bold"
                      >
                        VISIT ORIGINAL SOURCE <Share2 className="w-2.5 h-2.5" />
                      </a>
                      <button 
                        onClick={() => copyToClipboard(selectedStory.link, 'story-link')}
                        className="p-1 px-2 bg-slate-800 rounded border border-slate-700 text-[9px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedField === 'story-link' ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Clipboard className="w-2.5 h-2.5" />}
                        COPY LINK
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{selectedStory.description}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  {/* Left inner column: Details */}
                  <div className="space-y-4">
                    {/* Hooks */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">TikTok Hooks (Stop the Scroll)</label>
                      <ul className="space-y-4">
                        {[
                          { label: 'Nepali (Street)', text: pkg.hooks.nepali, color: 'text-[#25F4EE]' },
                          { label: 'English (Punchy)', text: pkg.hooks.english, color: 'text-[#FE2C55]' },
                          { label: 'Bilingual', text: pkg.hooks.bilingual, color: 'text-yellow-500' }
                        ].map((hook) => (
                          <li key={hook.label} className="flex flex-col gap-1 group relative">
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${hook.color}`}>{hook.label}</span>
                            <p className="text-sm italic text-slate-200">"{hook.text}"</p>
                            <button 
                              onClick={() => copyToClipboard(hook.text, `hook-${hook.label}`)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                            >
                              {copiedField === `hook-${hook.label}` ? <Check className="w-3 h-3 text-green-500" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Captions */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Caption & Hashtags</label>
                      <p className="text-sm leading-snug text-slate-300 pr-8">{pkg.caption}</p>
                      <button 
                        onClick={() => copyToClipboard(pkg.caption, 'caption')}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                      >
                        {copiedField === 'caption' ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Best Time & Comment Bait */}
                    <div className="flex gap-4">
                      <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase mb-1 font-bold">Best Post Time</span>
                        <span className="text-lg font-black text-white italic tracking-tighter">
                          7:45 PM <span className="text-[10px] text-slate-600 not-italic uppercase font-mono ml-1">NST</span>
                        </span>
                      </div>
                      <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase mb-1 font-bold">Comment Bait</span>
                        <span className="text-xs font-semibold text-slate-300 italic">"Rate 1-10 your anger 😡"</span>
                      </div>
                    </div>
                  </div>

                  {/* Right inner column: Image Preview */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Nano Banna Image Preview</label>
                    <div ref={previewRef} className={`flex-1 ${pkg.imageText.bgColor} rounded-2xl relative flex flex-col p-8 shadow-2xl overflow-hidden group border border-white/10`}>
                      {/* Grid Pattern Decoration */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="bg-black/20 self-start px-2 py-1 inline-block text-[10px] font-black italic uppercase mb-6 tracking-tighter border border-white/10 backdrop-blur-sm">BREAKING NEWS</div>
                          <h4 className="text-5xl font-black leading-[0.85] tracking-tighter uppercase mb-6 italic drop-shadow-2xl">
                            {pkg.imageText.headline.split(' ').map((word, i) => (
                              <span key={i} className="block">{word}</span>
                            ))}
                          </h4>
                          <p className="text-lg font-bold leading-tight text-white/90 drop-shadow-md">
                            {pkg.imageText.subtext} {pkg.imageText.emojis}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 border-t border-white/20 pt-4">
                          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-[10px]">🇳🇵</div>
                          <div className="text-[10px] font-black uppercase tracking-widest italic">NEPAL VIRAL STUDIO</div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="mt-4 w-full bg-[#25F4EE] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#25F4EE]/10 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                          PREPARING...
                        </>
                      ) : (
                        <>
                          EXPORT TO PHONE
                          <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex justify-between items-center text-[9px] text-slate-500 uppercase font-bold tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-default">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            Session: Active
          </span>
          <span className="hover:text-slate-300 transition-colors cursor-default">Target: Gen-Z (16-30)</span>
          <span className="hover:text-slate-300 transition-colors cursor-default">Region: Nepal / India</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[#25F4EE] flex items-center gap-1.5">
            <div className="w-1 h-1 bg-[#25F4EE] rounded-full animate-ping"></div>
            TikTok API Connected
          </span>
          <span className="text-slate-700">Build: v4.8-AIS</span>
        </div>
      </footer>

      {/* Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

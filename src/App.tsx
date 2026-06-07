import React, { useState, useRef } from 'react';
import { generateStoryboard, generateFrameImage } from './lib/gemini';
import { GeneratedFrame, Storyboard, VideoQuality } from './types';
import ShortsPreview, { ShortsPreviewHandle } from './components/ShortsPreview';
import { Sparkles, Wand2, Loader2, Video, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'en-US', name: 'English', label: 'English 🇺🇸' },
  { code: 'kn-IN', name: 'Kannada', label: 'ಕನ್ನಡ (Kannada) 🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', label: 'हिन्दी (Hindi) 🇮🇳' },
  { code: 'te-IN', name: 'Telugu', label: 'తెలుగు (Telugu) 🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', label: 'தமிழ் (Tamil) 🇮🇳' },
  { code: 'es-ES', name: 'Spanish', label: 'Español 🇪🇸' },
  { code: 'fr-FR', name: 'French', label: 'Français 🇫🇷' },
  { code: 'de-DE', name: 'German', label: 'Deutsch 🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', label: '日本語 🇯🇵' }
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState<VideoQuality>('1080p');
  const [duration, setDuration] = useState<number>(30); // Default 30s
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [status, setStatus] = useState<'idle' | 'storyboarding' | 'generating-images' | 'ready'>('idle');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [frames, setFrames] = useState<GeneratedFrame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viralVoice, setViralVoice] = useState(true); // Default to true for the user request
  const [scapes, setScapes] = useState({ rain: false, city: false, forest: false });
  const previewRef = useRef<ShortsPreviewHandle>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setStatus('storyboarding');
      setError(null);
      setFrames([]); // Clear previous frames
      
      const sb = await generateStoryboard(prompt, duration, language.name, viralVoice);
      setStoryboard(sb);
      
      setStatus('generating-images');
      const generatedFrames: GeneratedFrame[] = [];
      
      for (const frame of sb.frames) {
        // Pass quality hints to prompt for better image quality
        const qualityHint = quality === '4k' ? 'ultra high definition, 4k, cinematic master, sharp details, extremely high resolution' : 
                          quality === '1080p' ? 'high definition, sharp, crisp' : 
                          quality === '720p' ? 'standard definition' : 'low resolution cartoon style';
        
        const imageUrl = await generateFrameImage(`${frame.imagePrompt}. Style: ${qualityHint}`);
        generatedFrames.push({ ...frame, imageUrl });
        // Update frames incrementally for visual feedback
        setFrames([...generatedFrames]);
      }
      
      setStatus('ready');
    } catch (err: any) {
      console.error(err);
      let userMessage = 'An unexpected error occurred';
      
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        userMessage = 'API Channel hit normal rate limits. Don\'t worry, there are unlimited video generates available. Let\'s render again or wait a few seconds!';
      } else if (err.message?.includes('500') || err.message?.includes('overloaded')) {
        userMessage = 'The AI engine is highly requested. Press rendering again to trigger backup servers.';
      } else {
        userMessage = err.message || userMessage;
      }

      setError(userMessage);
      setStatus('idle');
    }
  };

  const handleDownload = () => {
    previewRef.current?.startRecording();
  };

  return (
    <div className="min-h-screen bg-[#FFDE00] text-black font-sans border-[12px] border-black flex flex-col">
      {/* Header */}
      <nav className="h-20 bg-white border-b-[6px] border-black flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-[#FFDE00] rotate-45"></div>
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter">Cartoon Shorts</span>
        </div>
        <div className="flex gap-4">
          <div className="hidden sm:block px-4 py-1 border-2 border-black font-bold uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{formatTime(duration)} Timeline</div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="lg:w-[380px] border-r-[6px] border-black flex flex-col bg-white overflow-y-auto">
          <div className="p-8 flex-1 space-y-8">
            <header className="space-y-1">
              <h1 className="text-4xl font-black uppercase leading-none italic tracking-tighter">Artistic Shorts</h1>
            </header>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase mb-2">Video Concept</label>
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe your story for a ${formatTime(duration)} cartoon animation...`}
                    className="w-full h-40 p-4 border-4 border-black bg-slate-50 text-lg font-bold placeholder:text-black/20 focus:outline-none focus:bg-white transition-all resize-none shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2">Narrator Language</label>
                <div className="relative">
                  <select
                    value={language.code}
                    onChange={(e) => {
                      const selected = LANGUAGES.find(l => l.code === e.target.value);
                      if (selected) setLanguage(selected);
                    }}
                    className="w-full p-2.5 border-4 border-black bg-white text-sm font-black uppercase appearance-none focus:outline-none cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFDE00]/10"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="font-extrabold uppercase text-xs text-black bg-white">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black border-l-4 border-black bg-[#FFDE00]">
                    <span className="text-xs font-black">▼</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2">Duration Timeline</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: '5s', value: 5 },
                    { label: '30s', value: 30 },
                    { label: '2m', value: 120 },
                    { label: '10m', value: 600 }
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`py-2 border-2 border-black font-bold text-xs uppercase transition-all ${
                        duration === d.value ? 'bg-black text-white font-black' : 'hover:bg-slate-100 font-medium'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-2">Export Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['480p', '720p', '1080p', '4k'] as VideoQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`py-2 border-2 border-black font-bold text-xs uppercase transition-all ${
                        quality === q ? 'bg-black text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Most Viral Delivery & Ambient Soundscapes Toggles */}
              <div className="pt-4 border-t-2 border-black/10 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-wider">⚡ Narrative Delivery Style</label>
                    <span className="bg-red-500 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded animate-pulse">Hot Trend</span>
                  </div>
                  <button
                    onClick={() => setViralVoice(!viralVoice)}
                    className={`w-full py-2 px-3 border-2 border-black font-black text-xs uppercase flex items-center justify-between transition-all ${
                      viralVoice ? 'bg-black text-[#FFDE00]' : 'bg-white hover:bg-slate-50 text-black'
                    }`}
                  >
                    <span>🎤 Most Viral Delivery Voice</span>
                    <span className="text-[10px] font-mono">{viralVoice ? 'ACTIVE // HYPE RATE (1.35x)' : 'CINEMATIC STANDARD'}</span>
                  </button>
                  <p className="text-[9px] text-black/50 font-bold uppercase mt-1 italic leading-tight">
                    * Speeds up dialogue, raises pitch, and formats high-impact uppercase captions!
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-2">🎶 Layer Ambient Soundscapes</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'rain', label: '🌧️ Heavy Rain', desc: 'Pink Noise' },
                      { key: 'city', label: '🏙️ City Hub', desc: 'Traffic & Horns' },
                      { key: 'forest', label: '🌲 Cozy Forest', desc: 'Wind & Chirps' },
                    ].map((scape) => {
                      const isActive = scapes[scape.key as keyof typeof scapes];
                      return (
                        <button
                          key={scape.key}
                          onClick={() => setScapes(prev => ({
                            ...prev,
                            [scape.key]: !isActive
                          }))}
                          className={`p-2 border-2 border-black flex flex-col justify-between text-left transition-all relative overflow-hidden h-[54px] ${
                            isActive ? 'bg-[#FFDE00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black' : 'bg-slate-50 text-black/70 hover:bg-slate-100 font-bold'
                          }`}
                        >
                          <span className="text-[10px] leading-tight uppercase font-extrabold">{scape.label}</span>
                          <span className="text-[8px] opacity-60 font-mono tracking-tighter leading-none">{scape.desc}</span>
                          {isActive && (
                            <span className="absolute top-0 right-1 text-[8px] font-black">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={status !== 'idle' && status !== 'ready'}
                  className="w-full py-5 bg-black text-white font-black text-xl uppercase tracking-widest hover:translate-y-[-4px] active:translate-y-[0px] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:translate-y-0"
                >
                  {status === 'idle' || status === 'ready' ? (
                    <span>Render Video</span>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">{status === 'storyboarding' ? 'S_BOARDING...' : 'GENERATING...'}</span>
                    </div>
                  )}
                </button>

              {status === 'ready' && frames.length > 0 && (
                <div className="pt-6 border-t-[4px] border-black space-y-4">
                  <div className="flex items-center gap-2 bg-[#FFDE00] border-2 border-black p-2 font-black uppercase text-xs italic tracking-tighter">
                    <span className="w-2 h-2 bg-black rounded-full animate-ping"></span>
                    📥 Export & Gallery Studio
                  </div>
                  
                  <div className="space-y-2">
                    {/* Bulk Downloads */}
                    <button
                      onClick={() => {
                        // Staggered downloads of all high-resolution images to the device gallery
                        frames.forEach((frame, idx) => {
                          setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = frame.imageUrl || '';
                            link.download = `cartoon_scene_${idx + 1}_${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }, idx * 350);
                        });
                        
                        // Automatically download designated language script text too!
                        const text = frames.map((f, idx) => `[Scene ${idx + 1} - ${f.duration}s]\nVoiceover Script (${language.name}): ${f.narration}\nVisual Action (English): ${f.description}\n`).join('\n');
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `cartoon_shorts_${language.name.toLowerCase()}_script_${Date.now()}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full py-3 bg-emerald-400 border-4 border-black text-black font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
                    >
                      <Download size={18} />
                      Save All Scenes to Gallery
                    </button>

                    {/* Compile Video */}
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-[#FFDE00] border-4 border-black text-black font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
                    >
                      <Video size={18} />
                      Compile & Download Video
                    </button>

                    {/* Transcript Only */}
                    <button
                      onClick={() => {
                        const text = frames.map((f, idx) => `[Scene ${idx + 1} - ${f.duration}s]\nVoiceover Script (${language.name}): ${f.narration}\nVisual Action (English): ${f.description}\n`).join('\n');
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `cartoon_shorts_${language.name.toLowerCase()}_script_${Date.now()}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full py-2 bg-slate-100 border-2 border-black text-black font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span>Download {language.name} Narration Script (.txt)</span>
                    </button>
                  </div>

                  {/* Individual Scene-by-Scene Quick Download Hub */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider opacity-60 text-left">Tap Any Scene to Download Image Direct</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {frames.map((frame, idx) => (
                        <button
                          key={frame.id}
                          onClick={() => {
                            if (!frame.imageUrl) return;
                            const link = document.createElement('a');
                            link.href = frame.imageUrl;
                            link.download = `cartoon_gallery_scene_${idx + 1}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="relative aspect-square border-2 border-black overflow-hidden group hover:scale-105 transition-transform"
                          title="Click to Download Image"
                        >
                          <img src={frame.imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Download size={14} className="text-white fill-white" />
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-black text-[#FFDE00] font-black text-[8px] uppercase text-center py-0.5">
                            SC_{idx + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-100 border-4 border-black text-red-600 font-bold text-sm">
                  SYSTEM_ERROR: {error}
                </div>
                <div className="text-[10px] font-bold text-black/60 uppercase p-2 border-2 border-black/10 bg-slate-50 italic">
                  Tip: Unlimited generation is fully configured! Retrying automatically fixes minor rate limitations.
                </div>
                <button 
                  onClick={handleGenerate}
                  className="w-full py-3 border-4 border-black font-black uppercase text-sm hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Force Retrigger Render
                </button>
              </div>
            )}

            {/* Storyboard Progress */}
            {storyboard && (
              <div className="space-y-4 pt-4 border-t-2 border-black/10">
                <div className="flex items-center justify-between uppercase text-xs font-black italic">
                  <span>Rendering Scenes</span>
                  <span className="font-mono text-[10px]">{frames.length} / {storyboard.frames.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {storyboard.frames.map((frame, idx) => (
                    <div 
                      key={frame.id} 
                      className={`border-2 border-black p-3 space-y-1 relative transition-colors ${
                        idx < frames.length ? 'bg-[#FFDE00]/20' : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-black opacity-40">CH_{idx + 1}</div>
                      <p className="text-[10px] font-bold leading-tight line-clamp-1">{frame.description}</p>
                      {status === 'generating-images' && idx === frames.length && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-6 bg-[#FFDE00] border-t-[6px] border-black flex items-center justify-between text-[11px] font-black uppercase">
            <span>ToonShorts Creator</span>
            <span>v2.5</span>
          </div>
        </aside>

        {/* Preview Canvas Area */}
        <section className="flex-1 bg-[#121212] flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {frames.length > 0 ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full max-h-[800px]"
              >
                <ShortsPreview 
                  ref={previewRef} 
                  frames={frames} 
                  quality={quality} 
                  languageCode={language.code}
                  ambientSounds={scapes}
                  viralVoice={viralVoice}
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="h-full aspect-[9/16] max-h-[600px] bg-white/5 border-[6px] border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 mb-6 italic font-black text-white/20 text-4xl">!</div>
                <div className="space-y-2">
                  <h3 className="font-black uppercase text-xl text-white/40 tracking-tighter">Enter Prompt for {formatTime(duration)} Movie</h3>
                  <p className="text-xs text-white/20 font-mono">WAITING_FOR_SEQUENCE_INIT</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="absolute bottom-6 left-8 right-8 flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <div>CINEMATIC MODE</div>
            <div>{formatTime(duration)} TIMELINE</div>
          </footer>
        </section>
      </main>
    </div>
  );
}

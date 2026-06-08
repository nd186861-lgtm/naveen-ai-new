import React, { useState, useRef, useEffect } from 'react';
import { generateStoryboard, generateFrameImage, generateSpeech, generateChatResponse } from './lib/gemini';
import { GeneratedFrame, Storyboard, VideoQuality } from './types';
import ShortsPreview, { ShortsPreviewHandle } from './components/ShortsPreview';
import { 
  Sparkles, 
  Wand2, 
  Loader2, 
  Video, 
  Download, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  Edit2, 
  Layers, 
  RefreshCw, 
  HelpCircle, 
  BookOpen, 
  Volume2, 
  Languages,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Calendar,
  ArrowRight,
  Clock,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Calculator,
  User,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Agency Configuration Lists
const SERVICES = [
  {
    id: 'ai-shorts',
    title: 'AI Cartoon Shorts',
    desc: 'Cinematic 9:16 high-impact micro-animations optimized for peak viewer retention and instant social loops.',
    deliverables: '30-60s Toon, Custom Soundtrack, Subtitles, Narration',
    price: '₹10,000',
    emoji: '👾',
    popular: true
  },
  {
    id: 'kids-anim',
    title: 'YouTube Kids Animation',
    desc: 'Bright, heartwarming, and kid-safe story animation chapters perfect for bedtime tales or nursery rhymes.',
    deliverables: 'Full-HD story reel, joyful voices, custom colorful character rigs',
    price: '₹25,000',
    emoji: '🧸',
    popular: false
  },
  {
    id: 'story-vids',
    title: 'AI Storytelling Videos',
    desc: 'Immersive mythological, historical, or fictional narrative films featuring dramatic pacing & audio soundscapes.',
    deliverables: 'Script generation, continuous voice synthesis, scenic pans',
    price: '₹15,000',
    emoji: '🐉',
    popular: false
  },
  {
    id: 'brand-mascot',
    title: 'Brand Mascot Reels',
    desc: 'Turn your logo or mascot concept into an active voice character advocating your SaaS, brand, or agency values.',
    deliverables: 'Custom character sheet, brand typography overlays, custom audio',
    price: '₹30,000',
    emoji: '🚀',
    popular: true
  },
  {
    id: 'edu-cartoons',
    title: 'Educational Explainer',
    desc: 'Break down complex financial, tech, or math concepts into animated, bite-sized infographic cartoons.',
    deliverables: 'Dynamic diagrams, engaging visual analogies, professional tempo',
    price: '₹18,000',
    emoji: '🎓',
    popular: false
  },
  {
    id: 'viral-shorts',
    title: 'High-Retention Reels Pack',
    desc: 'A monthly calendar batch of hyper-edited storytelling animated reels designed to generate 1M+ views.',
    deliverables: '10x high-impact shorts, trending hook structures, organic CTA loops',
    price: '₹75,000',
    emoji: '💸',
    popular: false
  }
];

const PORTFOLIOS = [
  {
    title: 'The Clumsy Baby Dragon',
    category: 'Kids Cartoon Stories',
    views: '2.4M Views',
    duration: '30s Loop',
    rating: '5.0',
    bgPrompt: 'A cute clumsy baby dragon trying to toast a giant pink marshmallow in a cozy stone castle kitchen',
    illustration: '🐉',
    client: 'ToonTales Kids HD'
  },
  {
    title: 'Space Hamster Chronicles',
    category: 'Nostalgic Sci-Fi Shorts',
    views: '1.8M Views',
    duration: '5s Teaser',
    rating: '4.9',
    bgPrompt: 'A chubby hamster wearing a round glass spaceship helmet floating on Mars looking at yellow stars',
    illustration: '🚀',
    client: 'GalaxyHub Shorts'
  },
  {
    title: 'Ancient Egypt Tuxedo Cat',
    category: 'Historical Mythos',
    views: '4.2M Views',
    duration: '60s Short',
    rating: '5.0',
    bgPrompt: 'A majestic tuxedo cat dressed as a pharaoh inside a glowing sand pyramid being worshiped by royal mice',
    illustration: '🐱',
    client: 'HistoryInToons'
  }
];

const FAQS = [
  {
    q: 'How long does it take to deliver a completed Cartoon Short?',
    a: 'Our standard turnaround is 2 to 3 days. Standard animated storyboards and scripts are drawn instantly by our high-performing Gemini engines, then tuned and polished to perfection by our production design staff.'
  },
  {
    q: 'Am I given complete commercial and copyright ownership?',
    a: 'Absolutely! Upon final pay-stub delivery of the video pack, all intellectual property rights, commercial licenses, high-resolution visual frames, and vocal audio narration tracks belong completely and lifetime-free to you.'
  },
  {
    q: 'In which languages can you generate narration voiceovers?',
    a: 'We support rendering premium expressive AI vocals in over 9+ local and international languages, including Kannada, Hindi, Telugu, Tamil, Spanish, French, German, Japanese, and custom English accents!'
  },
  {
    q: 'Can I request revision changes after the frames are generated?',
    a: 'Yes, we provide 2 to 4 rounds of manual script updates, layout edits, or voice re-syntheses depending on your chosen project package tier. Even inside our sandbox editor, you can redraw or click to translate any line instantly!'
  },
  {
    q: 'Do you offer discount packages for high-volume monthly creators?',
    a: 'Yes! Our monthly content retainer packages offer up to a 35% discount for YouTubers and brands committed to publishing 15 to 30 shorts per month. Contact our AI Agent Chatbot or submit a lead to plan custom rates.'
  }
];

const CASE_STUDIES = [
  {
    title: 'How "HistoryInToons" Got 4.2 Million Views in 14 Days',
    desc: 'By switching from generic stick figures to our bespoke Volumetric Pixar 3D art style and incorporating local viral language narrations, click-through-rates soared from 3.2% to 18.4%.',
    metric: '+430%',
    sub: 'Subscriber Growth Rate'
  },
  {
    title: 'SaaS Mascot Brand Campaign ROI Case Study',
    desc: 'An AI startup integrated our "Space Hamster" Mascot animation reels into their social ad strategy. Acquisition costs slashed by half, leading to ₹8,50,000 in monthly recurring revenues.',
    metric: '₹2.8M',
    sub: 'Total Revenue Generated'
  }
];

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

const ART_STYLES = [
  { id: 'pixar', name: 'Volumetric Pixar 3D', emoji: '🧸', prompt: '3D Pixar Disney style cartoon, cute animated movie 3d asset, soft volumetric lighting, clay textures, cinematic character focus' },
  { id: 'anime', name: 'Aesthetic Anime Studio', emoji: '🌸', prompt: 'Japanese Anime hand-drawn film cell style, Studio Ghibli inspired scenic background, vibrant aesthetic colors, high details' },
  { id: 'retro', name: 'Retro Cartoon Network', emoji: '📺', prompt: '90s classic cartoon network sticker style, thick bold black outlines, cel-shaded coloring, retro organic handpainted feel' },
  { id: 'watercolor', name: 'Fairytale Watercolor', emoji: '🎨', prompt: 'Adorable chibi children book illustration, cozy watercolor paper textures, pastel dreamy gradients, soft magical fantasy aesthetic' },
  { id: 'cyberpunk', name: 'Future Cyber Neon', emoji: '⚡', prompt: 'Vibrant futuristic vaporwave cartoon, high-contrast neon lines, cybernetic outlines, techno-synth anime sketch' },
];

const PROMPT_TEMPLATES = [
  {
    title: '🐉 Clumsy Baby Dragon',
    text: 'A cute clumsy baby dragon trying to toast a giant pink marshmallow in a cozy stone castle kitchen, but accidentally scorching his own tail.',
    duration: 30,
    languageCode: 'en-US'
  },
  {
    title: '🚀 Space Hamster',
    text: 'A chubby hamster wearing a round glass spaceship helmet floating on Mars, high-fiving a friendly yellow star under cosmic nebula gas.',
    duration: 5,
    languageCode: 'en-US'
  },
  {
    title: '🐱 Time-Traveling Cat',
    text: 'A majestic tuxedo cat entering a cardboard box time machine with blinking buttons, arriving in ancient Egypt where royal mice are worshiping him with fish.',
    duration: 30,
    languageCode: 'ja-JP'
  },
  {
    title: '🦊 Detective Autumn Fox',
    text: 'A clever reddish fox wearing a tiny wool detective trench coat inspecting a glowing golden neon acorn clue under redwood trees in a cozy misty autumn forest.',
    duration: 120,
    languageCode: 'en-US'
  },
  {
    title: '🛸 Alien Ice Cream Thief',
    text: 'A goofy lime-green alien using a blue tractor beam to pull a giant ice cream truck and colorful popsicles up towards his small saucer spaceship.',
    duration: 30,
    languageCode: 'es-ES'
  }
];

export default function App() {
  // Navigation Mode state: 'agency' for sales/landing page representation, 'studio' for free lifetime editor sandbox
  const [appMode, setAppMode] = useState<'agency' | 'studio'>('agency');
  
  // Studio sandbox state values
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState<VideoQuality>('1080p');
  const [duration, setDuration] = useState<number>(30); // Default 30s
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0]);
  const [status, setStatus] = useState<'idle' | 'storyboarding' | 'ready-to-render' | 'generating-images' | 'ready'>('idle');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [frames, setFrames] = useState<GeneratedFrame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viralVoice, setViralVoice] = useState(true);
  const [scapes, setScapes] = useState({ rain: false, city: false, forest: false });
  const [activeTab, setActiveTab] = useState<'planner' | 'workbench'>('planner');
  const [renderingFrameId, setRenderingFrameId] = useState<string | null>(null);
  const [generatingVoiceFrameId, setGeneratingVoiceFrameId] = useState<string | null>(null);
  const [isBulkGeneratingVoices, setIsBulkGeneratingVoices] = useState<boolean>(false);
  
  const previewRef = useRef<ShortsPreviewHandle>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Agency Sales Interactive Pricing & ROI calculator values
  const [calcShorts, setCalcShorts] = useState<number>(10);
  const [calcViews, setCalcViews] = useState<number>(120000); // Average views per video
  const [calculatedCost, setCalculatedCost] = useState<number>(100000);
  const [traditionalAnimateCost, setTraditionalAnimateCost] = useState<number>(400000);
  const [estimatedAdEarnings, setEstimatedAdEarnings] = useState<number>(250000);
  const [roiPercentage, setRoiPercentage] = useState<number>(150);

  // Agency Live Conversational Chatbot Widget states
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; date: string }>>([
    { sender: 'agent', text: 'Hey there! I’m Aero, your Pixar-style Animation Consultant. Ask me anything about our custom character work, delivery times, multi-language narration, or the secret to going viral with cartoon reels! 🚀', date: 'Just now' }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotReplying, setIsChatbotReplying] = useState(false);

  // Agency Lead Submission Capture drawer values
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadDetails, setLeadDetails] = useState('');
  const [leadBudget, setLeadBudget] = useState('₹10,000 - ₹25,000');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Live Stats Counter Simulator
  const [simulatedEarnings, setSimulatedEarnings] = useState(6484300);

  // Toggle open accordion FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-increment dynamic revenue statistics counter for premium presentation feel
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedEarnings(prev => prev + Math.floor(Math.random() * 25) + 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync pricing calculator metrics instantly on changes
  useEffect(() => {
    const cost = calcShorts * 10000;
    const traditional = calcShorts * 35000;
    // Calculate dynamic sponsor + ad revenue estimation based on views
    const earnings = Math.round((calcViews * calcShorts * 0.18)); 
    const roi = cost > 0 ? Math.round(((earnings - cost) / cost) * 100) : 0;

    setCalculatedCost(cost);
    setTraditionalAnimateCost(traditional);
    setEstimatedAdEarnings(earnings);
    setRoiPercentage(roi);
  }, [calcShorts, calcViews]);

  // Submit Quote lead details simulator
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone) {
      alert("Please fill in your name, email, and WhatsApp coordinates so our strategist can ping you within 15 minutes.");
      return;
    }
    setLeadSubmitted(true);
    setTimeout(() => {
      // Auto reply chatbot congratulating them on the inquiry
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `🎯 SUCCESS! Your project brief for "${leadDetails || 'Viral Toon Project'}" has been assigned to our senior creative director. We will text you at ${leadPhone} and email you at ${leadEmail} within 15 minutes with a comprehensive visual blueprint concept and budget quote!`,
          date: 'Just now'
        }
      ]);
      setChatbotOpen(true);
    }, 1200);
  };

  // Chat conversation delivery handler via Gemini API
  const handleSendChatMessage = async () => {
    if (!chatbotInput.trim() || isChatbotReplying) return;

    const userMsg = chatbotInput.trim();
    setChatbotInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, date: 'Just now' }]);
    setIsChatbotReplying(true);

    try {
      // Build historic context array
      const historyContext = chatMessages.concat({ sender: 'user', text: userMsg, date: 'Just now' }).map(msg => ({
        text: msg.text
      }));

      const reply = await generateChatResponse(historyContext);
      setChatMessages(prev => [...prev, { sender: 'agent', text: reply, date: 'Just now' }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'Hmm, I temporary lost node track. But no worries! Our starting package is ₹10,000 for a 30-second loop. Tap the top header bar tab “Launch Creator Workspace Sandbox” to play, draw, translate, or generate cartoon frames immediately for free!',
          date: 'Just now'
        }
      ]);
    } finally {
      setIsChatbotReplying(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumericalViews = (views: number) => {
    if (views >= 100000) return `${(views / 100000).toFixed(1)} Lakh`;
    return `${(views / 1000).toFixed(0)}k`;
  };

  // Load preset sandbox script from template
  const loadTemplate = (tmpl: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(tmpl.text);
    setDuration(tmpl.duration);
    const matchedLang = LANGUAGES.find(l => l.code === tmpl.languageCode);
    if (matchedLang) setLanguage(matchedLang);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Studio planning action
  const handlePlanStoryboard = async () => {
    if (!prompt.trim()) return;

    try {
      setStatus('storyboarding');
      setError(null);
      setStoryboard(null);
      setFrames([]);

      const sb = await generateStoryboard(prompt, duration, language.name, viralVoice);
      setStoryboard(sb);

      const initialFrames: GeneratedFrame[] = sb.frames.map(f => ({
        ...f,
        imageUrl: undefined
      }));

      setFrames(initialFrames);
      setStatus('ready-to-render');
      setActiveTab('workbench'); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Auxiliary pipeline failure. Tap Storyboard button again to restart rendering node.');
      setStatus('idle');
    }
  };

  const handleRenderSingleFrame = async (frameId: string) => {
    const frameIndex = frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) return;

    const frame = frames[frameIndex];
    setRenderingFrameId(frameId);
    setError(null);

    try {
      const qHint = quality === '4k' ? 'ultra high definition, cinematic 4k film clip' : 
                    quality === '1080p' ? 'high definition, sharp crisp focus' : 'standard cartoon style';
      
      const compositePrompt = `${frame.imagePrompt}. Art Style Vibe: ${selectedStyle.prompt}. Rendering quality hint: ${qHint}`;
      const imageUrl = await generateFrameImage(compositePrompt);

      setFrames(prev => prev.map(f => f.id === frameId ? { ...f, imageUrl } : f));
    } catch (err: any) {
      console.error(err);
      setError(`Failed to render Scene ${frameIndex + 1}: Rate limit or connection interruption. Let's tap 'AI Redraw' again in 2 seconds.`);
    } finally {
      setRenderingFrameId(null);
    }
  };

  const handleRenderAllRemaining = async () => {
    setStatus('generating-images');
    setError(null);

    try {
      const qHint = quality === '4k' ? 'ultra high definition, cinematic 4k film clip' : 
                    quality === '1080p' ? 'high definition, sharp crisp focus' : 'standard cartoon style';

      const updatedFrames = [...frames];

      for (let i = 0; i < updatedFrames.length; i++) {
        const frame = updatedFrames[i];
        if (!frame.imageUrl) {
          setRenderingFrameId(frame.id);
          const compositePrompt = `${frame.imagePrompt}. Art Style Vibe: ${selectedStyle.prompt}. Rendering quality hint: ${qHint}`;
          const imageUrl = await generateFrameImage(compositePrompt);
          updatedFrames[i] = { ...frame, imageUrl };
          setFrames([...updatedFrames]);
        }
      }

      setStatus('ready');
    } catch (err: any) {
      console.error(err);
      setError(`Bulk rendering paused: ${err.message || 'API quota threshold met. You can draw single scenes or tap "Draw" to try again.'}`);
      setStatus('ready-to-render');
    } finally {
      setRenderingFrameId(null);
    }
  };

  const handleGenerateVoiceForFrame = async (frameId: string) => {
    const frameIndex = frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) return;

    const frame = frames[frameIndex];
    setGeneratingVoiceFrameId(frameId);
    setError(null);

    try {
      const styleHint = viralVoice ? 'hype' : 'warm';
      const result = await generateSpeech(frame.narration, language.name, styleHint);
      
      const audioUrl = `data:${result.mimeType};base64,${result.data}`;
      setFrames(prev => prev.map(f => f.id === frameId ? { ...f, audioUrl } : f));
    } catch (err: any) {
      console.error(err);
      setError(`Failed to speak voiceover for Scene ${frameIndex + 1}: using automated browser speech translation fallback.`);
    } finally {
      setGeneratingVoiceFrameId(null);
    }
  };

  const handleGenerateVoicesForAll = async () => {
    setIsBulkGeneratingVoices(true);
    setError(null);

    try {
      const updatedFrames = [...frames];
      const styleHint = viralVoice ? 'hype' : 'warm';

      for (let i = 0; i < updatedFrames.length; i++) {
        const frame = updatedFrames[i];
        if (!frame.audioUrl) {
          setGeneratingVoiceFrameId(frame.id);
          const result = await generateSpeech(frame.narration, language.name, styleHint);
          const audioUrl = `data:${result.mimeType};base64,${result.data}`;
          updatedFrames[i] = { ...frame, audioUrl };
          setFrames([...updatedFrames]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(`AI voiceover synthesis complete.`);
    } finally {
      setGeneratingVoiceFrameId(null);
      setIsBulkGeneratingVoices(false);
    }
  };

  const handleUpdateFrameField = (frameId: string, field: keyof GeneratedFrame, value: any) => {
    setFrames(prev => prev.map(f => f.id === frameId ? { ...f, [field]: value } : f));
  };

  const handleAddNewScene = () => {
    const newId = `frame_${Date.now()}`;
    const newFrame: GeneratedFrame = {
      id: newId,
      imagePrompt: 'A cute character on a colorful and playful background, cartoon illustration, happy mood',
      description: 'An exciting new custom scene frame.',
      narration: language.code === 'en-US' ? 'And then, a marvelous thing happened next!' : 'மற்றும் ஒரு அற்புதமான விஷயம் நடந்தது!',
      duration: 5,
      animationType: 'zoom-in'
    };
    setFrames(prev => [...prev, newFrame]);
  };

  const handleDeleteScene = (frameId: string) => {
    setFrames(prev => prev.filter(f => f.id !== frameId));
  };

  const processInsertedFile = (file: File, frameId: string) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload standard image formats (JPEG/PNG/WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Url = event.target.result as string;
        setFrames(prev => prev.map(f => f.id === frameId ? { ...f, imageUrl: base64Url } : f));
      }
    };
    reader.readAsDataURL(file);
  };

  const totalCalculatedDuration = frames.reduce((acc, f) => acc + f.duration, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#FFD600] selection:text-black flex flex-col antialiased">
      
      {/* GLOBAL HEADER BAR: Premium Agency Navigation & Toggle Mode */}
      <nav id="agency-header" className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b-2 border-slate-900 h-20 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-amber-400 via-[#FFDE00] to-[#FF9000] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,222,0,0.25)]">
            <span className="text-xl sm:text-2xl animate-bounce">🎬</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-md sm:text-xl font-black uppercase tracking-tight text-white">ToonSpace Studio</span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase leading-none">agency</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wide text-slate-400 block font-bold leading-none uppercase">Premium AI Cartoon Shorts Creator</span>
          </div>
        </div>

        {/* Action Controls Toggle Mode: Free Sandbox Workspace vs Production Sales */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="btn-toggle-agency"
            onClick={() => setAppMode('agency')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              appMode === 'agency'
                ? 'bg-slate-900 border border-amber-400/50 text-amber-400 shadow-[0_0_10px_rgba(255,222,0,0.1)]'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Sparkles size={13} />
            <span className="hidden xs:inline">Studio Home</span>
          </button>

          <button
            id="btn-toggle-studio"
            onClick={() => {
              setAppMode('studio');
              // Preload dynamic story placeholder guidelines if empty
              if (frames.length === 0) {
                setPrompt(PROMPT_TEMPLATES[0].text);
                setDuration(30);
              }
            }}
            className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              appMode === 'studio'
                ? 'bg-gradient-to-r from-[#FFD600] to-amber-400 text-slate-950 shadow-[0_4px_16px_rgba(255,214,0,0.3)] font-black hover:brightness-105'
                : 'bg-[#FFDE00] text-slate-950 font-black hover:opacity-90 shadow-[0_2px_8px_rgba(255,222,0,0.15)]'
            }`}
          >
            <Wand2 size={13} />
            <span>Sandbox Workspace</span>
            <span className="bg-black text-[8px] font-bold text-[#FFDE00] px-1 py-0.5 rounded tracking-tighter">LIFETIME FREE</span>
          </button>
        </div>
      </nav>

      {/* CORE VIEWPORT ANCHOR */}
      <AnimatePresence mode="wait">
        
        {appMode === 'agency' ? (
          
          /* AGENCY PORTAL SALES PLATFORM LANDING */
          <motion.div
            key="agency-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col"
          >
            
            {/* HERO HEROICS SECTION */}
            <header className="relative py-20 sm:py-32 px-4 sm:px-8 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-900 overflow-hidden">
              {/* Dynamic decorative backdrop particles */}
              <div className="absolute top-20 left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
              
              <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 text-[10px] sm:text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  Premium Full-Service AI Animation Studio
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-white leading-[1.05]">
                  Turn Ideas Into <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-[#FFD600] via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Viral AI Cartoon Shorts
                  </span>
                </h1>

                <p className="max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-slate-400 font-medium">
                  We craft professional Pixar-inspired, highly cohesive animated cartoon shorts starting at ₹10,000 for brands, educational creators, kids channels, and YouTubers looking to scale audience retention.
                </p>

                {/* Simulated Stats Banner row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto py-6">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-xs font-mono text-slate-500 uppercase block">Total Generated</span>
                    <span className="text-lg font-extrabold text-white">430k+ Videos</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/85 rounded-xl p-3 text-center">
                    <span className="text-xs font-mono text-slate-500 uppercase block">Active Clients</span>
                    <span className="text-lg font-extrabold text-white">730+ Creators</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3 text-center">
                    <span className="text-xs font-mono text-slate-500 uppercase block">Client Retention Room</span>
                    <span className="text-lg font-extrabold text-emerald-400">98.4% Views</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-xs font-mono text-slate-500 uppercase block">Total Client Profit</span>
                    <span className="text-lg font-extrabold text-[#FFD600] tracking-tight">{formatCurrency(simulatedEarnings)}</span>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-3 justify-center pt-4">
                  <a
                    href="#quote-anchor"
                    className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl hover:translate-y-[-2px] transition-all duration-200 shadow-[0_4px_20px_rgba(255,222,0,0.25)] flex items-center justify-center gap-2"
                  >
                    <span>Book Strategy Consultation</span>
                    <ArrowRight size={15} />
                  </a>
                  
                  <button
                    onClick={() => {
                      setAppMode('studio');
                      setPrompt(PROMPT_TEMPLATES[1].text);
                      setDuration(5);
                    }}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-850 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Wand2 size={15} className="text-amber-400" />
                    <span>Try Free Character Sandbox</span>
                  </button>
                </div>
              </div>
            </header>

            {/* SERVICES INGREDIENTS SECTION */}
            <section id="services-section" className="py-20 bg-slate-950 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">our deliverables</span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">Professional Services Suite</h2>
                  <p className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm">
                    No boring slide reels or flat vector cutouts. Every video is engineered with high fidelity spatial scenes, tailored localized scripts, and premium voice synthesis.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SERVICES.map((item) => (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group border ${
                        item.popular
                          ? 'bg-slate-900/80 border-amber-400/30 shadow-[0_4px_25px_rgba(255,222,0,0.04)] hover:border-amber-400/60'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item.popular && (
                        <span className="absolute top-4 right-4 bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                          🔥 Viral Best
                        </span>
                      )}

                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                          {item.emoji}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold uppercase text-white group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">Starting Price</span>
                          <span className="text-md sm:text-lg font-black text-white">{item.price}</span>
                        </div>
                        <a
                          href="#quote-anchor"
                          className="py-2 px-3 bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-white font-black text-[10px] uppercase rounded-lg transition-all"
                        >
                          Enquire Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* INTERACTIVE COST & ROI CALCULATOR SECTION */}
            <section id="roi-calculator" className="py-20 bg-slate-900/40 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center space-y-3 mb-12">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">smart planning</span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Interactive ROI Calculator</h2>
                  <p className="max-w-lg mx-auto text-slate-400 text-xs sm:text-sm">
                    Discover how switching from traditional animation studios (re-charging up to ₹35,000 per video) to our rapid AI design studio translates to heavy savings and scaling ad-clicks.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10">
                  {/* Left Controls */}
                  <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
                        <span className="flex items-center gap-1.5 font-black text-white">
                          <Video size={13} className="text-amber-400" />
                          Volume: Animated Shorts Per Month
                        </span>
                        <span className="bg-slate-800 text-white px-2.5 py-1 rounded font-extrabold">{calcShorts} Videos</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={calcShorts}
                        onChange={(e) => setCalcShorts(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>1 Short</span>
                        <span>15 Shorts</span>
                        <span>30 Shorts</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
                        <span className="flex items-center gap-1.5 font-black text-white">
                          <TrendingUp size={13} className="text-amber-400" />
                          Estimated Views Per Short Target
                        </span>
                        <span className="bg-slate-800 text-white px-2.5 py-1 rounded font-extrabold">{formatNumericalViews(calcViews)} Views</span>
                      </div>
                      <input
                        type="range"
                        min={5000}
                        max={500000}
                        step={5000}
                        value={calcViews}
                        onChange={(e) => setCalcViews(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>5,000 Views</span>
                        <span>2.5 Lakh Views</span>
                        <span>5 Lakh Views</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850/60">
                      <h4 className="text-xs font-bold uppercase text-[#FFD600] flex items-center gap-1">
                        <ShieldCheck size={12} />
                        How does CPM monetization calculation work?
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Estimations are based on a standard YouTube/Reels CPM index profile mapping ₹180-220 return per 1,000 views including direct affiliate sales, sponsors, and monetization payouts. Results may vary depending on style hooks.
                      </p>
                    </div>
                  </div>

                  {/* Right Results Readout */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest block border-b border-slate-8 sm:pb-2">
                        Investment Efficiency:
                      </h4>

                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 uppercase">Our Studio Bill</span>
                        <span className="text-sm font-mono text-[#FFD650] font-black">{formatCurrency(calculatedCost)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 uppercase">Traditional Agency Cost</span>
                        <span className="text-sm font-mono text-red-400 line-through font-bold">{formatCurrency(traditionalAnimateCost)}</span>
                      </div>

                      <div className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center">
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Direct Saved Profit</span>
                        <span className="text-xs font-mono font-black text-emerald-400">-{formatCurrency(traditionalAnimateCost - calculatedCost)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Estimated Views Return Earnings</span>
                      <span className="text-2xl sm:text-3xl font-black text-white block">
                        {formatCurrency(estimatedAdEarnings)}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400 mt-1">
                        <Zap size={11} />
                        <span>ROI Indicator: {roiPercentage}% Net Return</span>
                      </div>
                    </div>

                    <a
                      href="#quote-anchor"
                      className="w-full text-center py-3 bg-[#FFDE00] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase rounded-xl transition-all"
                    >
                      Lock In This Rate Now
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* CASE STUDIES CARDS SECTION */}
            <section className="py-20 bg-slate-950 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">proven tracking records</span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Viral Toon Case Studies</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {CASE_STUDIES.map((cs) => (
                    <div key={cs.title} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
                      <div className="inline-block bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 text-amber-300 rounded font-extrabold text-[10px] uppercase">
                        Organic Showcase Case Study
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold uppercase text-white">{cs.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">{cs.desc}</p>
                      
                      <div className="pt-4 flex items-center gap-4">
                        <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase block font-mono">Performance Metric</span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-400">{cs.metric}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-extrabold uppercase">
                          {cs.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PORTFOLIO ANIMATED GALLERY SHOWCASE */}
            <section id="portfolio-section" className="py-20 bg-slate-900/30 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">active gallery screen</span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">Interactive Toon Portfolio</h2>
                  <p className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm">
                    Hover and select any concept project. These actual cartoon animations can be generated, previewed, and modified directly inside our sandbox creator workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PORTFOLIOS.map((item, idx) => (
                    <div
                      key={item.title}
                      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-400/40 transition-all duration-300"
                    >
                      <div className="h-48 bg-slate-950 relative flex items-center justify-center p-6 border-b border-slate-800">
                        {/* Elegant background simulation */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-900/30" />
                        <span className="text-5xl relative z-10 transition-transform group-hover:scale-110 duration-300">{item.illustration}</span>
                        
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                          {item.duration}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/5 px-2 py-0.5 border border-amber-400/10 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs text-emerald-400 font-black">{item.views}</span>
                        </div>
                        
                        <h3 className="text-md sm:text-lg font-bold text-white uppercase group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>Client: {item.client}</span>
                          <span className="text-[#FFD600] flex items-center">★ {item.rating}</span>
                        </div>

                        <button
                          onClick={() => {
                            setPrompt(item.bgPrompt);
                            setDuration(idx === 1 ? 5 : 30);
                            setAppMode('studio');
                          }}
                          className="w-full py-2 bg-slate-950 border border-slate-850 hover:bg-amber-400 hover:text-slate-950 text-white text-[10px] uppercase font-black tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Clone Project Script</span>
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* HOW IT WORKS TIMELINE DYNAMIC STEPPER */}
            <section className="py-20 bg-slate-950 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">our rapid pipeline</span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">How It Works</h2>
                  <p className="max-w-md mx-auto text-slate-400 text-xs sm:text-sm">
                    From original story outline brainstorms to a polished high-definition video narration, we co-create with lightning speed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                  {[
                    { s: '01', title: 'Submit Idea Concept', desc: 'Plug in or tell Aero our consulting mascot your general animation premise in any format.' },
                    { s: '02', title: 'AI Storyboard Scripting', desc: 'Our targeted Gemini models write expressive, retention-heavy narrator scripts.' },
                    { s: '03', title: 'Art Direction Drawing', desc: 'Choose between anime sketch, watercolor magic or 3D Disney/Pixar vector frames.' },
                    { s: '04', title: 'Expressive Vocal Setup', desc: 'Generate multi-language premium translations of voice narrations instantly.' },
                    { s: '05', title: 'Atmosphere Audios', desc: 'We synch atmospheric ambient loops: mountain breeze, rain showers or busy city streets.' },
                    { s: '06', title: 'Final Delivery & Hand-off', desc: 'Retrieve high-definition exports in 1080p or ultra-high-resolution 4k, ready to publish!' }
                  ].map((step) => (
                    <div key={step.s} className="bg-slate-900/30 border border-slate-850 rounded-xl p-5 relative group overflow-hidden">
                      <span className="absolute right-4 top-4 text-slate-800 font-mono text-3xl font-black group-hover:text-amber-400/20 transition-colors">
                        {step.s}
                      </span>
                      <h4 className="text-md sm:text-lg font-extrabold uppercase text-white group-hover:text-amber-400 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* WHY CHOOSE US CARDS */}
            <section className="py-20 bg-slate-900/20 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">our unfair edge</span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Why Choose ToonSpace</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { icon: <Clock className="text-amber-400" />, title: '48hr Express Dispatch', desc: 'Never wait months for typical visual studios. Your cartoon loops are drafted instantly and completed in two days.' },
                    { icon: <Zap className="text-amber-400" />, title: 'High Viral Retention', desc: 'We optimize frame durations and fast narration flow modes specifically mapped for TikTok and Reels search triggers.' },
                    { icon: <Sparkles className="text-amber-400" />, title: 'AI-Powered Scalability', desc: 'Generate multiple storyboard concepts for client selection at zero extra mock-up overhead cost.' },
                    { icon: <Award className="text-amber-400" />, title: 'Stellar Pixar Integrity', desc: 'Our visual aesthetics reject lazy slides, guaranteeing professional lighting, custom fonts, and crisp frames.' },
                    { icon: <DollarSign className="text-amber-400" />, title: 'Affordable Pricing Tier', desc: 'Premium vector reels starting at ₹10,000, saving you massive upfront production budgets.' },
                    { icon: <Volume2 className="text-amber-400" />, title: 'Multilingual Voices', desc: 'Render audio narratives in Devanagari script text, Kannada, Telugu, English and Spanish voice models.' }
                  ].map((feat) => (
                    <div key={feat.title} className="bg-slate-900/50 hover:bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3 transition-colors">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                        {feat.icon}
                      </div>
                      <h4 className="text-md font-bold uppercase text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* THE PRICING DECK MATRICES */}
            <section id="pricing-section" className="py-20 bg-slate-950 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">flexible investment tiers</span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">Straightforward Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Starter Toon */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 relative">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-bold">starter loop</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase font-mono">Popular</span>
                      </div>
                      <div className="text-3xl font-black text-white">₹10,000</div>
                      <p className="text-xs text-slate-400 font-medium">
                        Ideal for introductory YouTube Shorts, single viral loops, or social brand teasers.
                      </p>
                      
                      <ul className="space-y-2 text-xs text-slate-300 font-mono pt-4 border-t border-slate-800/60">
                        <li className="flex items-center gap-1.5">✓ 30-Second Max Duration</li>
                        <li className="flex items-center gap-1.5">✓ Professional AI Narration Voice</li>
                        <li className="flex items-center gap-1.5">✓ Standard Full-HD 1080p Export</li>
                        <li className="flex items-center gap-1.5">✓ 2 Complete Storyboard Revisions</li>
                        <li className="flex items-center gap-1.5">✓ Commercial Ownership License</li>
                      </ul>
                    </div>

                    <a
                      href="#quote-anchor"
                      className="w-full py-3 bg-slate-800 text-white hover:bg-[#FFDE00] hover:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                    >
                      Choose Starter
                    </a>
                  </div>

                  {/* Pro Toon */}
                  <div className="bg-slate-900/80 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-8 relative shadow-[0_4px_30px_rgba(255,222,0,0.06)]">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      ★ Recommended Model
                    </span>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-350 uppercase font-black">Professional Toon</span>
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase font-mono">Top Pick</span>
                      </div>
                      <div className="text-3xl font-black text-[#FFD600]">₹25,000</div>
                      <p className="text-xs text-slate-300 font-medium">
                        Best suited for serious kids storytelling networks, myth explainer channels, or custom business mascots.
                      </p>
                      
                      <ul className="space-y-2 text-xs text-slate-200 font-mono pt-4 border-t border-amber-400/10">
                        <li className="flex items-center gap-1.5 text-amber-300">✓ 60-Second Full Storyline Duration</li>
                        <li className="flex items-center gap-1.5">✓ Bespoke Cohesive Character Design</li>
                        <li className="flex items-center gap-1.5">✓ Premium High-Impact Narration</li>
                        <li className="flex items-center gap-1.5">✓ Soundscapes Atmospheric Audio</li>
                        <li className="flex items-center gap-1.5">✓ 4 Detailed Frame Revisions</li>
                        <li className="flex items-center gap-1.5">✓ 4k Ultra high-definition file output</li>
                      </ul>
                    </div>

                    <a
                      href="#quote-anchor"
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-105 transition-all text-center"
                    >
                      Choose Professional
                    </a>
                  </div>

                  {/* Agency Retainer */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 relative">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-bold">bulk monthly partner</span>
                      </div>
                      <div className="text-3xl font-black text-white">₹50,000+</div>
                      <p className="text-xs text-slate-400 font-medium">
                        For publishing teams seeking reliable, high-volume cartoon output (10 to 30 shorts per month).
                      </p>
                      
                      <ul className="space-y-2 text-xs text-slate-300 font-mono pt-4 border-t border-slate-800/60">
                        <li className="flex items-center gap-1.5">✓ Complete Monthly Video Batch Packages</li>
                        <li className="flex items-center gap-1.5">✓ Dedicated Creative Account Manager</li>
                        <li className="flex items-center gap-1.5">✓ Priority Queue Processing (&lt;24hr)</li>
                        <li className="flex items-center gap-1.5">✓ Direct Sound effects integration</li>
                        <li className="flex items-center gap-1.5">✓ White-Label agency delivery</li>
                      </ul>
                    </div>

                    <a
                      href="#quote-anchor"
                      className="w-full py-3 bg-slate-800 text-white hover:bg-[#FFDE00] hover:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                    >
                      Enquire Custom Retainer
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* FREQUENT JARGONS FAQ SECTION */}
            <section className="py-20 bg-slate-900/30 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">propective questions</span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 sm:p-5 flex justify-between items-center text-left text-white font-bold hover:text-amber-400 transition-colors"
                        >
                          <span className="text-sm sm:text-base font-extrabold">{faq.q}</span>
                          {isOpen ? <ChevronUp size={18} className="text-[#FFD600]" /> : <ChevronDown size={18} />}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-850 bg-slate-950/60"
                            >
                              <div className="p-4 sm:p-5 text-slate-350 text-xs sm:text-sm font-medium leading-relaxed font-mono">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* LEAD GENERATION FORM PORTAL */}
            <section id="quote-anchor" className="py-20 bg-gradient-to-t from-slate-950 to-slate-900 border-b border-slate-900 px-4 sm:px-8">
              <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-12 space-y-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                
                <div className="text-center space-y-3 border-b border-slate-800/80 pb-6">
                  <span className="text-[10px] font-mono text-[#FFD600] tracking-widest uppercase">instant quotation pipeline</span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold uppercase text-white leading-tight">Ready to Create Your Movie?</h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Submit your concept ideas below. Our senior strategists will sketch a comprehensive video script plan and WhatsApp you back with a quote within 15 minutes!
                  </p>
                </div>

                {leadSubmitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xl mx-auto shadow-md">
                      ✓
                    </div>
                    <h3 className="text-lg font-black text-emerald-400 uppercase">Blueprints Conceptualized!</h3>
                    <p className="text-slate-300 text-xs font-medium max-w-md mx-auto">
                      Fantastic, <strong>{leadName}</strong>! We have received your briefing details for budget range <strong>{leadBudget}</strong>. We are aligning character designs right now on our design boards.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setLeadSubmitted(false);
                          setChatbotOpen(true);
                        }}
                        className="py-2 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-750 font-bold text-xs"
                      >
                        Talk to Live Strategist
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase text-slate-400 font-mono tracking-wider">Your Name <strong className="text-red-400">*</strong></label>
                        <input
                          type="text"
                          required
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          placeholder="E.g. Rohan Dev"
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-[#FFD600] transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase text-slate-400 font-mono tracking-wider">WhatsApp Number <strong className="text-red-400">*</strong></label>
                        <input
                          type="tel"
                          required
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          placeholder="E.g. +91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-[#FFD600] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase text-slate-400 font-mono tracking-wider">Email Address <strong className="text-red-400">*</strong></label>
                        <input
                          type="email"
                          required
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          placeholder="E.g. client@creators.com"
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-[#FFD600] transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase text-slate-400 font-mono tracking-wider">Target Project Budget</label>
                        <select
                          value={leadBudget}
                          onChange={(e) => setLeadBudget(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-[#FFD600] transition-all cursor-pointer"
                        >
                          <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000 (Intro Shorts)</option>
                          <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000 (Detailed Rigs)</option>
                          <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000 (Agency Retainer)</option>
                          <option value="₹1,00,000+">₹1,00,000+ (Bulk Campaign)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase text-slate-400 font-mono tracking-wider">Cartoon Concept / Storyline Brief Details</label>
                      <textarea
                        value={leadDetails}
                        onChange={(e) => setLeadDetails(e.target.value)}
                        placeholder="Explain your character concept (e.g., A funny monkey explaining cryptocurrency indices under a coconut tree...)"
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:border-[#FFD600] transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-amber-400 via-[#FFDE00] to-[#FF9000] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-[0_4px_16px_rgba(255,222,0,0.25)] flex items-center justify-center gap-2"
                      >
                        <Send size={15} />
                        <span>Get Free Creative Concept Quote</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </section>

            {/* PARTNER INTEGRATIONS BAR SHOWCASE */}
            <section className="py-12 bg-slate-950 px-4 sm:px-8 text-center border-t border-slate-900">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-4">Supported Integrations & Gateways</span>
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-40">
                <span className="text-sm font-extrabold text-white">💳 Stripe Checkout</span>
                <span className="text-sm font-extrabold text-white">💰 Razorpay Invoices</span>
                <span className="text-sm font-extrabold text-white">📅 Calendly strategy</span>
                <span className="text-sm font-extrabold text-white">💬 WhatsApp Direct</span>
                <span className="text-sm font-extrabold text-white">🤖 Email Automon</span>
              </div>
            </section>

            {/* AGENCY CORE FOOTER FOOTNOTES */}
            <footer className="py-12 bg-slate-950 border-t-2 border-slate-900 px-4 sm:px-8 text-center">
              <div className="max-w-4xl mx-auto space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">
                  © 2026 ToonSpace Agency Studios. All Rights Reserved. Co-created globally via Gemini 3.5.
                </span>
                <div className="flex justify-center gap-4 text-[10px] font-mono text-slate-500 uppercase">
                  <span>Privacy Integrity</span>
                  <span>•</span>
                  <span>Commercial licensing specs</span>
                  <span>•</span>
                  <span>Anti-AI Slop Quality Guard</span>
                </div>
              </div>
            </footer>

          </motion.div>
          
        ) : (
          
          /* CREATOR SANDBOX APP SUITE WORKSPACE */
          <motion.div
            key="studio-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col md:flex-row bg-[#FFFBEA]"
          >
            
            {/* LEFT EDITORIAL COLUMN */}
            <aside className="w-full md:w-[480px] xl:w-[500px] border-b-4 md:border-b-0 md:border-r-[6px] border-black flex flex-col bg-white overflow-y-auto">
              
              <div className="grid grid-cols-2 border-b-[6px] border-black bg-slate-100 sticky top-0 z-15">
                <button
                  onClick={() => setActiveTab('planner')}
                  className={`py-4 px-4 font-black text-xs uppercase flex items-center justify-center gap-2 border-r-[4px] border-black transition-all ${
                    activeTab === 'planner' 
                      ? 'bg-[#FFDE00] text-black font-black' 
                      : 'bg-white hover:bg-slate-100 text-black/60'
                  }`}
                >
                  <Languages size={15} className="text-black" />
                  Blueprint Studio
                </button>
                <button
                  onClick={() => {
                    if (frames.length === 0) {
                      alert("Please storyboard a concept or tap a template seed first!");
                      return;
                    }
                    setActiveTab('workbench');
                  }}
                  className={`py-4 px-4 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'workbench' 
                      ? 'bg-[#FFDE00] text-black' 
                      : 'bg-white hover:bg-slate-100 text-black/60'
                  }`}
                >
                  <Layers size={15} />
                  Storyboard Editor ({frames.length})
                </button>
              </div>

              <div className="p-6 sm:p-8 flex-1 space-y-8">
                
                {activeTab === 'planner' ? (
                  
                  /* INNER WORKPLAN BLUEPRINT SCREEN */
                  <div className="space-y-6 text-black">
                    <header className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 bg-[#FFDE00] px-3 py-1 border-2 border-black rounded-full text-[9px] font-black uppercase">
                        <Sparkles size={11} className="animate-spin text-black" />
                        PROTOTYPING SANDBOX
                      </div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 leading-none pt-1">
                        Cartoon Generator Sandbox
                      </h2>
                      <p className="text-[11px] font-bold text-slate-500 uppercase leading-snug">
                        Use this playground to test out storyboard writing, drawing artwork style assets, and synthesizing narration in multiple languages.
                      </p>
                    </header>

                    {/* STORY PRESETS FOR FAST FEEDBACK */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <BookOpen size={11} />
                          Quick Toon Seed Templates
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PROMPT_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.title}
                            onClick={() => loadTemplate(tmpl)}
                            className="p-2 sm:p-3 border-2 border-black bg-[#FFFBEA] text-left hover:bg-[#FFDE00] hover:translate-y-[-2px] transition-all text-[11px] font-black uppercase tracking-tight flex flex-col justify-between group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <span className="text-slate-900 group-hover:underline block truncate">{tmpl.title}</span>
                            <span className="text-[8px] font-mono text-slate-500 block font-bold pt-1 uppercase">Duration: {tmpl.duration}s</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* STORYBOARD PROMPT MEMO TEXT */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="block text-[9px] font-extrabold uppercase text-slate-500">1. Dream Story Premise Detail</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe character scenes and antics..."
                        className="w-full h-24 p-3 border-2 border-black bg-slate-50 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white text-black resize-none"
                      />
                    </div>

                    {/* STYLE PICKER DIALS */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="block text-[9px] font-extrabold uppercase text-slate-500">2. Illustration Art Preset Vibe</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {ART_STYLES.map((style) => {
                          const isChosen = selectedStyle.id === style.id;
                          return (
                            <button
                              key={style.id}
                              onClick={() => setSelectedStyle(style)}
                              className={`p-1.5 border-2 border-black text-center flex flex-col items-center justify-center rounded transition-all ${
                                isChosen ? 'bg-[#FFDE00] font-black' : 'bg-slate-50 hover:bg-slate-100 font-bold'
                              }`}
                            >
                              <span className="text-lg leading-none">{style.emoji}</span>
                              <span className="text-[9px] uppercase tracking-tighter leading-none block pt-1">{style.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* LANGUAGE MULTILINGUAL TRANSLATION DROPDOWN */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="block text-[9px] font-extrabold uppercase text-slate-500">3. Voices Speech Translation</label>
                      <div className="relative">
                        <select
                          value={language.code}
                          onChange={(e) => {
                            const selected = LANGUAGES.find(l => l.code === e.target.value);
                            if (selected) setLanguage(selected);
                          }}
                          className="w-full p-2.5 border-2 border-black bg-white text-xs font-black uppercase appearance-none focus:outline-none cursor-pointer"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="text-xs text-black">
                              {lang.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black border-l-2 border-black bg-[#FFDE00]">
                          <span className="text-[10px]">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* MULTI TIMELINE DURATION INDEXED BOXES */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1.5">4. Target Duration</label>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded">
                          {[
                            { label: '5s Teaser', value: 5 },
                            { label: '30s Reel', value: 30 },
                          ].map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setDuration(t.value)}
                              className={`py-1 rounded font-black text-[9px] uppercase transition-all ${
                                duration === t.value ? 'bg-black text-[#FFDE00]' : 'bg-transparent text-slate-600 hover:text-black'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1.5">5. Render Quality</label>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded">
                          {(['1080p', '4k'] as VideoQuality[]).map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q)}
                              className={`py-1 rounded font-black text-[9px] uppercase transition-all ${
                                quality === q ? 'bg-black text-white' : 'bg-transparent text-slate-600 hover:text-black'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SYSTEM INTEGRITY SOUND AND HYPE SWITCHES */}
                    <div className="bg-slate-50 border-2 border-black p-3 space-y-2.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-slate-600">🎙️ High retention pacing</span>
                        <button
                          onClick={() => setViralVoice(!viralVoice)}
                          className={`text-[9px] font-extrabold px-2 py-0.5 border rounded uppercase ${
                            viralVoice ? 'bg-black text-[#FFDE00] border-black' : 'bg-white text-slate-500 border-slate-300'
                          }`}
                        >
                          {viralVoice ? 'TikTok Boost 1.35x' : 'Standard Dial'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-[9px] font-black uppercase text-slate-600">🌧️ Soundscapes Ambience</span>
                        <div className="flex gap-1.5">
                          {['rain', 'city', 'forest'].map((sk) => {
                            const val = scapes[sk as keyof typeof scapes];
                            return (
                              <button
                                key={sk}
                                onClick={() => setScapes(prev => ({ ...prev, [sk]: !val }))}
                                className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-extrabold ${
                                  val ? 'bg-[#FFDE00] border-black text-slate-900' : 'bg-white border-slate-200 text-slate-400'
                                }`}
                              >
                                {sk}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePlanStoryboard}
                      disabled={status === 'storyboarding' || !prompt.trim()}
                      className="w-full py-4 bg-[#FFDE00] border-4 border-black text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-black hover:text-[#FFDE00] transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                    >
                      {status === 'storyboarding' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Loader2 size={15} className="animate-spin text-black" />
                          <span>Generating Toon Blueprint...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <Wand2 size={15} />
                          <span>Draft Scenes & Narration</span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                ) : (
                  
                  /* INNER STORYBOARD EDIT WORKBENCH */
                  <div className="space-y-6 text-black">
                    <header className="flex justify-between items-center bg-[#FFFBEA] border-b-2 border-black pb-4">
                      <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Active Storyboard Canvas</h3>
                        <p className="text-[10px] uppercase text-slate-500 font-bold block">Tweak narration fields or insert fresh scenery.</p>
                      </div>
                      <button
                        onClick={handleAddNewScene}
                        className="py-1 px-2.5 bg-black text-[#FFDE00] font-black text-[9px] uppercase rounded border border-black hover:bg-slate-950 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Insert Scene
                      </button>
                    </header>

                    {error && (
                      <div className="bg-red-55 border-2 border-red-500 text-red-700 text-xs p-3 font-semibold rounded">
                        ⚠️ {error}
                      </div>
                    )}

                    {/* PROGRESS STATS DECK PANEL */}
                    <div className="bg-white border-2 border-black p-4 space-y-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span>Artwork Render Deck:</span>
                          <span>{frames.filter(f => f.imageUrl).length} / {frames.length} drawn</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full border border-slate-350 overflow-hidden relative">
                          <div 
                            className="h-full bg-emerald-400 transition-all duration-300"
                            style={{ width: `${frames.length > 0 ? (frames.filter(f => f.imageUrl).length / frames.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span>Custom Voice Synthesis:</span>
                          <span>{frames.filter(f => f.audioUrl).length} / {frames.length} voiceover ready</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full border border-slate-350 overflow-hidden relative">
                          <div 
                            className="h-full bg-amber-400 transition-all duration-350 animate-pulse"
                            style={{ width: `${frames.length > 0 ? (frames.filter(f => f.audioUrl).length / frames.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={handleRenderAllRemaining}
                          disabled={status === 'generating-images' || frames.length === 0}
                          className="py-2 bg-black text-[#FFDE00] hover:bg-slate-900 border border-black font-black text-[10px] uppercase rounded transition-colors disabled:opacity-40"
                        >
                          {status === 'generating-images' ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Loader2 size={11} className="animate-spin text-white" />
                              Coloring...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <Wand2 size={11} />
                              Color All Frames
                            </span>
                          )}
                        </button>

                        <button
                          onClick={handleGenerateVoicesForAll}
                          disabled={isBulkGeneratingVoices || frames.length === 0}
                          className="py-2 bg-white text-black hover:bg-[#FFDE00] border-2 border-black font-black text-[10px] uppercase rounded transition-colors disabled:opacity-40"
                        >
                          {isBulkGeneratingVoices ? (
                            <span className="flex items-center justify-center gap-1">
                              <Loader2 size={11} className="animate-spin" />
                              Speaking...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <Volume2 size={11} />
                              Generate Speech
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC LIST SCROLL DECK */}
                    <div className="space-y-4">
                      {frames.map((frame, index) => (
                        <div
                          key={frame.id}
                          className="border-2 border-black bg-white p-3.5 relative shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg space-y-4 text-black"
                        >
                          <div className="flex justify-between items-center bg-slate-900 text-white p-2 font-mono text-[9px] uppercase font-black tracking-wider">
                            <span>Scene #0{index + 1} ({frame.duration}s) - {frame.animationType}</span>
                            <button
                              onClick={() => handleDeleteScene(frame.id)}
                              className="text-red-400 hover:text-red-200 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="relative h-40 border-2 border-dashed border-slate-350 bg-slate-50 flex items-center justify-center overflow-hidden rounded group">
                            {frame.imageUrl ? (
                              <>
                                <img 
                                  src={frame.imageUrl} 
                                  alt="Toon Scene frame preview" 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity p-2">
                                  <span className="text-[10px] text-white font-mono uppercase bg-black/60 px-2 py-0.5 rounded">Drag and drop file replacement swapping supported</span>
                                  <div className="flex gap-2.5">
                                    <button
                                      onClick={() => fileInputRefs.current[frame.id]?.click()}
                                      className="py-1 px-2 bg-white border border-black font-black text-[9px] uppercase rounded flex items-center gap-1"
                                    >
                                      <Upload size={10} />
                                      Upload photo
                                    </button>
                                    <button
                                      onClick={() => handleRenderSingleFrame(frame.id)}
                                      className="py-1 px-2 bg-[#FFDE00] border border-black text-black font-black text-[9px] uppercase rounded flex items-center gap-1"
                                    >
                                      <RefreshCw size={10} />
                                      Toon Redraw
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center p-3 text-center">
                                {renderingFrameId === frame.id ? (
                                  <div className="space-y-1.5">
                                    <Loader2 size={20} className="animate-spin mx-auto text-[#FF9000]" />
                                    <span className="text-[9px] uppercase font-black text-slate-500 block">AI Sketching Illustration...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <span className="text-xl">🎨</span>
                                    <p className="text-[9px] uppercase text-slate-400 font-bold block max-w-[200px]">
                                      Toon Canvas Empty. Tap to illustrate
                                    </p>
                                    
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleRenderSingleFrame(frame.id)}
                                        className="py-1 px-2.5 bg-[#FFDE00] border border-black font-black text-[9px] uppercase rounded flex items-center gap-1 shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#FFD600]"
                                      >
                                        <Sparkles size={9} />
                                        Illustrate Frame
                                      </button>
                                      <button
                                        onClick={() => fileInputRefs.current[frame.id]?.click()}
                                        className="py-1 px-2.5 bg-white border border-slate-350 font-semibold text-[9px] uppercase rounded flex items-center gap-1"
                                      >
                                        <Upload size={9} />
                                        Replace
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              ref={el => { fileInputRefs.current[frame.id] = el; }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) processInsertedFile(f, frame.id);
                              }}
                              className="hidden"
                            />
                          </div>

                          {/* Image Prompt editor */}
                          <div className="space-y-1">
                            <label className="text-[8px] font-mono font-black uppercase text-slate-400 block pb-0.5">Asset Art prompt:</label>
                            <input
                              type="text"
                              value={frame.imagePrompt}
                              onChange={(e) => handleUpdateFrameField(frame.id, 'imagePrompt', e.target.value)}
                              className="w-full text-xs p-1.5 border border-black bg-white focus:bg-slate-50 text-black font-bold focus:outline-none"
                            />
                          </div>

                          {/* Narration script block */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[8px] font-mono font-black uppercase text-slate-400">Audio Narration Translation ({language.name}):</label>
                              <span className="text-[8px] text-[#FF9000] font-black uppercase">Gemini Narrator Track</span>
                            </div>
                            <textarea
                              value={frame.narration}
                              onChange={(e) => handleUpdateFrameField(frame.id, 'narration', e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2 border border-black bg-white focus:bg-slate-50 text-black font-bold focus:outline-none resize-none"
                            />

                            <div className="flex justify-between items-center pt-1">
                              {frame.audioUrl ? (
                                <span className="text-[8px] text-emerald-600 uppercase font-black flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 rounded">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                                  TTS Synthesized Loaded
                                </span>
                              ) : (
                                <span className="text-[8px] text-slate-400 font-mono italic">
                                  Standard vocal synthesis fallback active.
                                </span>
                              )}

                              <button
                                onClick={() => handleGenerateVoiceForFrame(frame.id)}
                                disabled={generatingVoiceFrameId === frame.id}
                                className="py-0.5 px-2 bg-slate-900 hover:bg-[#FFDE00] hover:text-black text-white font-black text-[8px] uppercase tracking-wide rounded transition-colors flex items-center gap-1 border border-black disabled:opacity-50"
                              >
                                {generatingVoiceFrameId === frame.id ? (
                                  <>
                                    <Loader2 size={8} className="animate-spin text-white" />
                                    Synthesizing...
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={8} />
                                    Speak Scene
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Scene duration pacing and motion types */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-[7.5px] font-mono font-black text-slate-400 block uppercase mb-0.5">Scene Duration (seconds)</span>
                              <input
                                type="number"
                                min={1}
                                max={60}
                                value={frame.duration}
                                onChange={(e) => handleUpdateFrameField(frame.id, 'duration', parseInt(e.target.value) || 5)}
                                className="w-full text-xs p-1 border border-black bg-white focus:outline-none font-bold text-center"
                              />
                            </div>

                            <div>
                              <span className="text-[7.5px] font-mono font-black text-slate-400 block uppercase mb-0.5">Focus Camera Motion Type</span>
                              <select
                                value={frame.animationType}
                                onChange={(e) => handleUpdateFrameField(frame.id, 'animationType', e.target.value)}
                                className="w-full text-[9px] p-1.5 border border-black bg-white uppercase font-black"
                              >
                                {['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'fade'].map(v => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleAddNewScene}
                        className="w-full py-4 bg-white border-2 border-dashed border-black hover:bg-slate-50 transition-colors text-xs font-black uppercase text-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      >
                        <Plus size={14} />
                        Insert Blank Toon Story Frame block
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* NEO WORKBENCH BAR FOOTER */}
              <div className="p-4 bg-slate-900 border-t-[4px] border-black text-slate-300 flex justify-between items-center text-[10px] uppercase font-bold font-mono">
                <span>Remix Playground 1.0</span>
                <span>Language Voice: {language.name} 🇮🇳</span>
              </div>
            </aside>

            {/* RIGHT PREVIEW SCREEN AND RECORDER DECK */}
            <section className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 relative">
              
              <div className="w-full max-w-[390px] h-[74%] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {frames.length > 0 && frames.some(f => f.imageUrl) ? (
                    <motion.div
                      key="active-shorts-frame"
                      className="w-full h-full"
                    >
                      <ShortsPreview
                        ref={previewRef}
                        frames={frames.filter(f => f.imageUrl) as GeneratedFrame[]}
                        quality={quality}
                        languageCode={language.code}
                        ambientSounds={scapes}
                        viralVoice={viralVoice}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-shorts-canvas"
                      className="w-full aspect-[9/16] bg-slate-950/80 border-[3px] border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-6 relative"
                    >
                      <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-2xl mb-4 animate-pulse">
                        👾
                      </div>
                      <div className="space-y-2 max-w-[260px]">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest leading-none">Assemble Story Loop</h4>
                        <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase">
                          {status === 'storyboarding' 
                            ? 'Processing narrative script index blueprint...'
                            : 'Select a template seed on the left, tap "Draft Scenes and Narration" and we will draw cartoon frames in real-time.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SAVE / EXPORTS EXPLAINER BOX when frames exist */}
              {frames.length > 0 && frames.some(f => f.imageUrl) && (
                <div className="w-full max-w-[400px] mt-4 bg-white border-2 border-black p-3.5 space-y-2 rounded-xl text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase bg-[#FFDE00] border border-black p-1 rounded italic leading-none">
                    <span className="w-2 h-2 bg-slate-950 rounded-full animate-ping block" />
                    📲 EXPORT REELS CHANNELS
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        frames.forEach((frame, idx) => {
                          if (frame.imageUrl) {
                            setTimeout(() => {
                              const link = document.createElement('a');
                              link.href = frame.imageUrl || '';
                              link.download = `toon_artwork_frame_${idx + 1}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }, idx * 250);
                          }
                        });

                        const transcriptTxt = frames.map((f, idx) => `[SCENE ${idx+1}]\nNarration Speech: ${f.narration}\nArt Direction prompt: ${f.imagePrompt}\n`).join('\n');
                        const blob = new Blob([transcriptTxt], { type: 'text/plain' });
                        const blobUrl = URL.createObjectURL(blob);
                        const doc = document.createElement('a');
                        doc.href = blobUrl;
                        doc.download = `studio_shorts_narration.txt`;
                        doc.click();
                      }}
                      className="py-2 px-3 bg-emerald-400 border border-black text-black font-extrabold text-[11px] uppercase rounded hover:bg-black hover:text-white transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1"
                    >
                      <Download size={13} />
                      Export Frames
                    </button>

                    <button
                      onClick={() => {
                        previewRef.current?.startRecording();
                      }}
                      className="py-2 px-3 bg-[#FFDE00] border border-black text-black font-extrabold text-[11px] uppercase rounded hover:bg-black hover:text-white transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1"
                    >
                      <Video size={13} />
                      Record Video
                    </button>
                  </div>
                </div>
              )}

              <footer className="absolute bottom-3 left-4 right-4 hidden sm:flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                <span>Preview Frame Stage</span>
                <span>Active Art Style: {selectedStyle.name}</span>
              </footer>

            </section>

          </motion.div>
        )}

      </AnimatePresence>

      {/* FLOAT INTERACTIVE CONVERSATIONAL CHATBOT BUTTON AND DRAWER WIDGET */}
      <div className="fixed bottom-6 right-6 z-[60]">
        
        {/* Floating Toggle Icon */}
        <button
          id="btn-chatbot-float"
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-[#FFDE00] to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-lg hover:rotate-12 transition-all group"
        >
          {chatbotOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <div className="relative">
              <span className="text-2xl">🤖</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
          )}
        </button>

        {/* Dynamic Chat Logs drawer box */}
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="absolute bottom-16 right-0 w-[310px] sm:w-[360px] h-[440px] bg-slate-900 border-2 border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100 z-50 transform origin-bottom-right"
            >
              {/* Header */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFDE00] flex items-center justify-center text-lg shadow-sm">
                    🧸
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-white block">Aero Animation Hub</span>
                    <span className="text-[8px] text-emerald-400 font-mono tracking-wider block font-extrabold uppercase leading-none">ONLINE • consultant</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatbotOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/80 scrollbar-thin">
                {chatMessages.map((msg, idx) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 max-w-[85%] ${isAgent ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isAgent ? 'bg-[#FFDE00] text-slate-950' : 'bg-slate-800 text-white'
                      }`}>
                        {isAgent ? 'A' : 'U'}
                      </div>
                      
                      <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                        isAgent ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-semibold'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isChatbotReplying && (
                  <div className="flex gap-2 max-w-[85%] mr-auto text-left">
                    <div className="w-6 h-6 rounded-full bg-[#FFDE00] text-slate-950 flex items-center justify-center text-[10px]">
                      A
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#FFDE00] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input Footer controls */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800/60 flex gap-2">
                <input
                  type="text"
                  value={chatbotInput}
                  onChange={(e) => setChatbotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage();
                  }}
                  placeholder="Ask Aero about rates, delivery..."
                  className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatbotInput.trim() || isChatbotReplying}
                  className="py-1.5 px-3 bg-amber-400 text-slate-950 rounded-xl hover:brightness-105 active:scale-95 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center disabled:opacity-40"
                >
                  <Send size={12} />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}

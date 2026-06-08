import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GeneratedFrame, VideoQuality } from '../types';
import { Play, Pause, RefreshCw, Volume2 } from 'lucide-react';
import { soundscape } from '../lib/audio';

interface ShortsPreviewProps {
  frames: GeneratedFrame[];
  quality?: VideoQuality;
  onFinish?: () => void;
  languageCode?: string;
  ambientSounds?: {
    rain: boolean;
    city: boolean;
    forest: boolean;
  };
  viralVoice?: boolean;
}

export interface ShortsPreviewHandle {
  startRecording: () => Promise<void>;
}

const ShortsPreview = forwardRef<ShortsPreviewHandle, ShortsPreviewProps>(({ 
  frames, 
  quality = '1080p', 
  onFinish, 
  languageCode = 'en-US',
  ambientSounds = { rain: false, city: false, forest: false },
  viralVoice = false
}, ref) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const animationFrameRef = useRef<number | null>(null);
  const stateRef = useRef({ currentFrameIndex, progress, isPlaying });
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update state reference to avoid stale closures in render loop
  useEffect(() => {
    stateRef.current = { currentFrameIndex, progress, isPlaying };
  }, [currentFrameIndex, progress, isPlaying]);

  // Audio handling via Speech Synthesis
  const synth = window.speechSynthesis;

  const speakNarration = (text: string, audioUrl?: string) => {
    if (isMuted) return;

    // Stop currently running SpeechSynthesis or custom audio elements
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    } catch (e) {}

    try {
      synth.cancel();
    } catch (e) {}

    // Play Premium base64 AI vocal track if loaded on this frame
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.play().catch(e => {
          console.warn("Speech Synthesis premium audio autoplay blocked, using fallback TTS:", e);
          fallbackSpeechSynthesis(text);
        });
      } catch (err) {
        console.error("Custom audio player exception, using fallback TTS:", err);
        fallbackSpeechSynthesis(text);
      }
    } else {
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      
      // Select appropriate voice matching target language code if available
      if (synth && typeof synth.getVoices === 'function') {
        const voices = synth.getVoices();
        const firstPart = languageCode.split('-')[0].toLowerCase();
        const matchedVoice = voices.find(v => 
          v.lang.toLowerCase() === languageCode.toLowerCase() || 
          v.lang.toLowerCase().replace('_', '-').startsWith(firstPart)
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
      
      // Apply "Viral Delivery" custom traits
      if (viralVoice) {
        utterance.rate = 1.35; // Energetic, fast viral clip rate
        utterance.pitch = 1.25; // Higher animated voice pitch
      } else {
        utterance.rate = 1.05; // Standard dramatic narrator pace
        utterance.pitch = 1.0;
      }

      synth.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed: ", e);
    }
  };

  // Manage volume muting of activeAudioRef dynamically
  useEffect(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Manage Soundscapes activation
  useEffect(() => {
    if (isPlaying && !isMuted && ambientSounds && (ambientSounds.rain || ambientSounds.city || ambientSounds.forest)) {
      soundscape.start(ambientSounds);
    } else {
      soundscape.stop();
    }
    return () => {
      soundscape.stop();
    };
  }, [isPlaying, isMuted, ambientSounds]);

  // Image preloading and caching
  useEffect(() => {
    frames.forEach(frame => {
      if (frame.imageUrl && !imageCacheRef.current[frame.imageUrl]) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // resolve cross-origin issues
        img.src = frame.imageUrl;
        imageCacheRef.current[frame.imageUrl] = img;
      }
    });
  }, [frames]);

  // Cinematic subtitles drawer helper
  const drawWrappedSubtitles = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineJoin = 'round';
    
    const processedText = viralVoice ? text.toUpperCase() : text;
    const words = processedText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    
    // Draw lines starting from bottom upwards
    let currentY = y - (lines.length - 1) * lineHeight;
    for (const line of lines) {
      // Outline stroke for perfect outer shadow and maximum legibility on any image
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.strokeText(line, x, currentY);
      
      // Crisp white front fill (or energetic yellow for viral hype reels)
      ctx.fillStyle = viralVoice ? '#FFDE00' : '#FFFFFF';
      ctx.fillText(line, x, currentY);
      
      currentY += lineHeight;
    }
    ctx.restore();
  };

  // Render loop to draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas dimensions matching selected Quality choice
    let internalW = 1080;
    let internalH = 1920;
    if (quality === '4k') {
      internalW = 2160;
      internalH = 3840;
    } else if (quality === '720p') {
      internalW = 720;
      internalH = 1280;
    } else if (quality === '480p') {
      internalW = 480;
      internalH = 854;
    }

    if (canvas.width !== internalW || canvas.height !== internalH) {
      canvas.width = internalW;
      canvas.height = internalH;
    }

    const draw = () => {
      const { currentFrameIndex: idx, progress: prg } = stateRef.current;
      if (frames.length === 0 || !frames[idx]) return;

      const frame = frames[idx];
      const img = imageCacheRef.current[frame.imageUrl || ""];

      // 1. Draw Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, internalW, internalH);

      // 2. Draw active Image with animations
      if (img && img.complete) {
        ctx.save();
        
        // Covering image calculation
        const sWidth = img.width;
        const sHeight = img.height;
        const cRatio = internalW / internalH;
        const iRatio = sWidth / sHeight;
        let sx = 0;
        let sy = 0;
        let sDrawWidth = sWidth;
        let sDrawHeight = sHeight;

        if (iRatio > cRatio) {
          sDrawWidth = sHeight * cRatio;
          sx = (sWidth - sDrawWidth) / 2;
        } else {
          sDrawHeight = sWidth / cRatio;
          sy = (sHeight - sDrawHeight) / 2;
        }

        // Transformations
        let scale = 1.0;
        let tx = 0;
        let ty = 0;
        const normPrg = prg / 100;
        if (frame.animationType === 'zoom-in') {
          scale = 1.0 + normPrg * 0.15;
        } else if (frame.animationType === 'zoom-out') {
          scale = 1.15 - normPrg * 0.15;
        } else if (frame.animationType === 'pan-left') {
          tx = (0.5 - normPrg) * 80;
        } else if (frame.animationType === 'pan-right') {
          tx = (normPrg - 0.5) * 80;
        } else if (frame.animationType === 'fade') {
          ctx.globalAlpha = Math.min(1, normPrg * 2);
        }

        ctx.translate(internalW / 2, internalH / 2);
        ctx.scale(scale, scale);
        ctx.translate(tx, ty);
        ctx.translate(-internalW / 2, -internalH / 2);

        ctx.drawImage(img, sx, sy, sDrawWidth, sDrawHeight, 0, 0, internalW, internalH);
        ctx.restore();
        ctx.globalAlpha = 1.0;
      } else {
        // Draw elegant visual draft template scene placeholder
        ctx.save();
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, internalW, internalH);

        // Draw dotted borders
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = Math.round(internalW * 0.01);
        ctx.setLineDash([20, 15]);
        ctx.strokeRect(40, 40, internalW - 80, internalH - 80);

        // Draw an adorable filmstrip or camera emoji
        ctx.font = `${Math.round(internalW * 0.12)}px "sans-serif"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("🎨", internalW / 2, internalH * 0.40);

        // Context info text
        ctx.fillStyle = '#A0A0A0';
        ctx.font = `bold ${Math.round(internalW * 0.035)}px "Inter", sans-serif`;
        ctx.fillText(`SCENE ${idx + 1} • CLICK RENDER`, internalW / 2, internalH * 0.50);
        
        ctx.fillStyle = '#555555';
        ctx.font = `${Math.round(internalW * 0.025)}px "Inter", sans-serif`;
        ctx.fillText("Tap 'Render' in editor tab to illustrate with Gemini", internalW / 2, internalH * 0.54);
        ctx.restore();
      }

      // 3. Draw Clean Panoramic Cinematic Subtitles directly over the image (No heavy watermark backgrounds or headers)
      ctx.save();
      ctx.font = `bold ${Math.round(internalW * 0.038)}px "Inter", sans-serif`;
      drawWrappedSubtitles(
        ctx,
        frame.narration || "",
        internalW / 2,
        internalH * 0.90,
        internalW * 0.85,
        Math.round(internalW * 0.048)
      );
      ctx.restore();

      // Keep repeating render frames
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [frames, quality]);

  // Handle Play/Pause interval and progress updating
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const currentFrame = frames[currentFrameIndex];
    const duration = currentFrame.duration * 1000;
    
    // Announce the narration in requested target language voiceover
    speakNarration(currentFrame.narration, currentFrame.audioUrl);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (currentFrameIndex < frames.length - 1) {
          setCurrentFrameIndex(v => v + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
          onFinish?.();
        }
      }
    }, 16);

    return () => {
      clearInterval(interval);
      try {
        synth.cancel();
      } catch (e) {}
      try {
        if (activeAudioRef.current) {
          activeAudioRef.current.pause();
          activeAudioRef.current = null;
        }
      } catch (e) {}
    };
  }, [currentFrameIndex, isPlaying, frames, onFinish]);

  // Expose startRecording handle for custom exports
  useImperativeHandle(ref, () => ({
    startRecording: async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setIsRecording(true);
      setCurrentFrameIndex(0);
      setProgress(0);
      setIsPlaying(true);
      setIsMuted(false);

      // Start capture from the HIGH RESOLUTION CANVAS element (crucial fix!)
      const videoStream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!videoStream) {
        alert("Video compilation stream not supported in this browser version. Please try modern Chrome, Safari or Firefox.");
        setIsRecording(false);
        return;
      }

      const recorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Create download block
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toon_movie_${quality}_${Date.now()}.webm`;
        a.click();

        // Download companion English Transcript script file for subtitles
        const narrationText = frames.map((f, idx) => `[Scene ${idx + 1} - ${f.duration}s]\n${f.narration}\n`).join('\n');
        const textBlob = new Blob([narrationText], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(textBlob);
        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `narrations_transcript_en_${Date.now()}.txt`;
        textLink.click();

        setIsRecording(false);
      };

      recorder.start();

      // Stop recorder when complete timeline finishes
      const totalDuration = frames.reduce((acc, f) => acc + f.duration, 0);
      setTimeout(() => {
        recorder.stop();
      }, totalDuration * 1000 + 400);
    }
  }));

  const handleReset = () => {
    setCurrentFrameIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  if (frames.length === 0) return null;

  return (
    <div className="relative h-full aspect-[9/16] bg-black border-[10px] border-white shadow-[30px_30px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain"
      />

      {/* HTML interactive progress overlay (renders on screen, stays out of canvas video block) */}
      <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
        {frames.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75"
              style={{
                width: idx < currentFrameIndex ? "100%" : (idx === currentFrameIndex ? `${progress}%` : "0%")
              }}
            />
          </div>
        ))}
      </div>

      {/* Pulsing Audio Indicator overlay in HTML (not encoded directly into the WebM render) */}
      {isPlaying && !isMuted && (
        <div className="absolute top-10 right-4 z-20 flex gap-0.5 items-end h-4 bg-black/40 px-2 py-1.5 rounded border border-white/10 backdrop-blur-xs">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className="w-1 bg-[#FFDE00] animate-bounce"
              style={{
                height: `${6 + Math.floor(Math.sin((Date.now() / 120) + i) * 8)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s"
              }}
            />
          ))}
        </div>
      )}

      {isRecording && (
        <div className="absolute top-16 left-4 z-30 flex items-center gap-2 bg-red-600 text-white px-2 py-1 text-[8px] font-black uppercase italic animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          RECORDING_WITH_AUDIO... (NARRATION SAVED)
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 pointer-events-none z-40">
        {!isRecording && (
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-white border-4 border-black text-black hover:bg-[#FFDE00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </button>
            <button 
              onClick={handleReset}
              className="p-4 bg-white border-4 border-black text-black hover:bg-[#FFDE00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <RefreshCw size={28} />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 border-4 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-[#FFDE00]'}`}
            >
              <Volume2 size={28} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ShortsPreview;

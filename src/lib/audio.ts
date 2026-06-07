// Web Audio API Programmatic Soundscape Synthesizer
// Synthesizes realistic soundscapes (Rain, City, Forest) from first principles using pure oscillators and filters.

class SoundscapeSynthesizer {
  private ctx: AudioContext | null = null;
  private nodes: {
    rainSource?: AudioNode;
    citySource?: AudioNode;
    forestSource?: AudioNode;
    gainNode?: GainNode;
  } = {};

  constructor() {
    // Lazy initialized when playback starts
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create pinkish/brownish noise for rain and wind
  private createNoiseBuffer(): AudioBuffer {
    const context = this.ctx!;
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise approximation filter
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }
    return noiseBuffer;
  }

  public start(scapes: { rain: boolean; city: boolean; forest: boolean }) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();

    // Destination gain master node
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // keep background sound subtle
    masterGain.connect(this.ctx.destination);
    this.nodes.gainNode = masterGain;

    const noiseBuffer = this.createNoiseBuffer();

    // 1. Synthesize Rain
    if (scapes.rain) {
      const rainNoise = this.ctx.createBufferSource();
      rainNoise.buffer = noiseBuffer;
      rainNoise.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      rainNoise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);

      rainNoise.start();
      this.nodes.rainSource = rainNoise;
    }

    // 2. Synthesize City (Hums, occasional distant car horns)
    if (scapes.city) {
      // Background traffic roar (pinkish noise + sub hum)
      const cityNoise = this.ctx.createBufferSource();
      cityNoise.buffer = noiseBuffer;
      cityNoise.loop = true;

      const cityFilter = this.ctx.createBiquadFilter();
      cityFilter.type = 'bandpass';
      cityFilter.frequency.setValueAtTime(150, this.ctx.currentTime);
      cityFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      const trafficGain = this.ctx.createGain();
      trafficGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      cityNoise.connect(cityFilter);
      cityFilter.connect(trafficGain);
      trafficGain.connect(masterGain);
      cityNoise.start();

      // Distant rhythmic car horn beep generator
      const beepOsc = this.ctx.createOscillator();
      beepOsc.type = 'triangle';
      beepOsc.frequency.setValueAtTime(440, this.ctx.currentTime);

      const beepGain = this.ctx.createGain();
      beepGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      beepOsc.connect(beepGain);
      beepGain.connect(masterGain);
      beepOsc.start();

      // Horn sequence scheduler
      const repeatBeep = () => {
        if (!this.ctx || !this.nodes.gainNode) return;
        const now = this.ctx.currentTime;
        // Trigger alert horn trigger
        beepGain.gain.setValueAtTime(0.0, now);
        beepGain.gain.linearRampToValueAtTime(0.03, now + 0.05);
        beepGain.gain.setValueAtTime(0.03, now + 0.15);
        beepGain.gain.linearRampToValueAtTime(0.0, now + 0.2);

        // Random schedule next beep
        const randTime = 4000 + Math.random() * 5000;
        setTimeout(repeatBeep, randTime);
      };
      
      setTimeout(repeatBeep, 2000);

      this.nodes.citySource = {
        disconnect: () => {
          cityNoise.disconnect();
          beepOsc.disconnect();
          try { cityNoise.stop(); } catch (e) {}
          try { beepOsc.stop(); } catch (e) {}
        }
      } as any;
    }

    // 3. Synthesize Cozy Forest (Wind rustling + synthesized birds chirps)
    if (scapes.forest) {
      const forestNoise = this.ctx.createBufferSource();
      forestNoise.buffer = noiseBuffer;
      forestNoise.loop = true;

      // Soft wind low-frequency sweep
      const forestFilter = this.ctx.createBiquadFilter();
      forestFilter.type = 'lowpass';
      forestFilter.frequency.setValueAtTime(500, this.ctx.currentTime);

      const forestGain = this.ctx.createGain();
      forestGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      forestNoise.connect(forestFilter);
      forestFilter.connect(forestGain);
      forestGain.connect(masterGain);
      forestNoise.start();

      // Bird chirp oscillator
      const birdOsc = this.ctx.createOscillator();
      birdOsc.type = 'sine';
      birdOsc.frequency.setValueAtTime(3000, this.ctx.currentTime);

      const birdGain = this.ctx.createGain();
      birdGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      birdOsc.connect(birdGain);
      birdGain.connect(masterGain);
      birdOsc.start();

      // Bird sequence scheduler
      const repeatChirp = () => {
        if (!this.ctx || !this.nodes.gainNode) return;
        const now = this.ctx.currentTime;
        
        // Quick series of double-chirps
        birdOsc.frequency.setValueAtTime(3200, now);
        birdOsc.frequency.exponentialRampToValueAtTime(4500, now + 0.1);
        birdGain.gain.setValueAtTime(0.0, now);
        birdGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
        birdGain.gain.exponentialRampToValueAtTime(0.0, now + 0.12);

        // Second chirp
        const secondTime = now + 0.15;
        birdOsc.frequency.setValueAtTime(3500, secondTime);
        birdOsc.frequency.exponentialRampToValueAtTime(4800, secondTime + 0.08);
        birdGain.gain.setValueAtTime(0.0, secondTime);
        birdGain.gain.linearRampToValueAtTime(0.04, secondTime + 0.02);
        birdGain.gain.exponentialRampToValueAtTime(0.0, secondTime + 0.1);

        const randTime = 3000 + Math.random() * 4000;
        setTimeout(repeatChirp, randTime);
      };

      setTimeout(repeatChirp, 1500);

      this.nodes.forestSource = {
        disconnect: () => {
          forestNoise.disconnect();
          birdOsc.disconnect();
          try { forestNoise.stop(); } catch (e) {}
          try { birdOsc.stop(); } catch (e) {}
        }
      } as any;
    }
  }

  public stop() {
    if (this.nodes.rainSource) {
      try { (this.nodes.rainSource as any).stop(); } catch (e) {}
      this.nodes.rainSource.disconnect();
    }
    if (this.nodes.citySource) {
      this.nodes.citySource.disconnect();
    }
    if (this.nodes.forestSource) {
      this.nodes.forestSource.disconnect();
    }
    if (this.nodes.gainNode) {
      this.nodes.gainNode.disconnect();
    }
    this.nodes = {};
  }
}

export const soundscape = new SoundscapeSynthesizer();

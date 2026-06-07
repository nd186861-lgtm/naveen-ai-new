export type VideoQuality = '480p' | '720p' | '1080p' | '4k';

export interface StoryboardFrame {
  id: string;
  imagePrompt: string;
  description: string;
  narration: string; // English voiceover script
  duration: number; // in seconds
  animationType: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'fade';
}

export interface Storyboard {
  title: string;
  frames: StoryboardFrame[];
}

export interface GeneratedFrame extends StoryboardFrame {
  imageUrl?: string;
}

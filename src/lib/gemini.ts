import { GoogleGenAI, Type } from "@google/genai";
import { Storyboard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if ((err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('overloaded')) && retries > 0) {
      console.log(`Rate limit, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function generateStoryboard(prompt: string, targetSeconds: number, languageName: string = "English", viralStyle: boolean = false): Promise<Storyboard> {
  return retryWithBackoff(async () => {
    let frameGuidelines = "";
    if (targetSeconds <= 5) {
      frameGuidelines = `The total duration must be exactly 5 seconds. Provide 4-5 fast-paced, high-impact frames. Each frame duration should sum up to exactly 5.`;
    } else if (targetSeconds <= 30) {
      frameGuidelines = `The total duration must be exactly 30 seconds. Provide 6-8 frames. Each frame duration should sum up to exactly 30.`;
    } else if (targetSeconds <= 120) {
      frameGuidelines = `The total duration must be exactly 120 seconds (2 minutes). Provide 10-15 deep, pacing frames. Each frame duration should be between 8 to 15 seconds, summing up to exactly 120.`;
    } else {
      frameGuidelines = `The total duration must be exactly ${targetSeconds} seconds. Provide 15-25 epic plot-segment scenes. Each scene duration should be longer (e.g., 20 to 35 seconds per scene) so that the total sum of durations is exactly ${targetSeconds} seconds. This is for a high-quality cinematic cartoon film.`;
    }

    let styleGuideline = "";
    if (viralStyle) {
      styleGuideline = `
      VIRAL RETENTION MODE ACTIVATED:
      - The narrator script "narration" must be extremely hook-heavy, energetic, dramatic and fast-paced (styled like a viral TikTok, YouTube Short, or Instagram Reel).
      - Include dramatic suspense hooks right in the first frame ("Wait until the end...!", "You won't believe what happened...!", "This is the story of...!").
      - Keep sentences short, punching, high-impact and emotionally sensational in the target language ("${languageName}").
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create a ${targetSeconds}-second storyboard for a cartoon animation based on this prompt: "${prompt}". 
      ${frameGuidelines} 
      ${styleGuideline}
      
      CRITICAL LANGUAGE REQUIREMENT:
      - The narration text ("narration") MUST be composed and written entirely in the "${languageName}" language (using ${languageName} script characters if applicable, such as Kannada characters for Kannada, Devanagari for Hindi, etc.). This narration is read out loud by the voice narrator.
      - The "imagePrompt" and "description" fields MUST be written in English so that image generator models can interpret and draw them correctly.
      
      Each frame needs an image prompt (in English), a description of the visual action (in English), a narration script in ${languageName} (for narration voiceover), a duration, and an animation type.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            frames: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING, description: "Detailed visual prompt for image generation in English" },
                  description: { type: Type.STRING, description: "Visual description for the UI in English" },
                  narration: { type: Type.STRING, description: "Narration script translated entirely into the requested language" },
                  duration: { type: Type.NUMBER },
                  animationType: { 
                    type: Type.STRING, 
                    enum: ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'fade'] 
                  }
                },
                required: ["id", "imagePrompt", "description", "narration", "duration", "animationType"]
              }
            }
          },
          required: ["title", "frames"]
        }
      }
    });

    return JSON.parse(response.text);
  });
}

export async function generateFrameImage(prompt: string): Promise<string> {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Cartoon style animation frame: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
  });
}

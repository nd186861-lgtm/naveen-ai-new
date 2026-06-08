import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for GoogleGenAI client (robust error handling in case key is missing)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY process environment variable is not defined in Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Backoff helper
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

// API endpoint for generating storyboard
app.post('/api/generate-storyboard', async (req, res) => {
  const { prompt, targetSeconds, languageName, viralStyle } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const ai = getGeminiClient();
    
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

    const sb = await retryWithBackoff(async () => {
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

    res.json(sb);
  } catch (error: any) {
    console.error("Error in generate-storyboard endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate storyboard" });
  }
});

// API endpoint for generating high-quality AI narration audio (Kannada, English, etc.)
app.post('/api/generate-voice', async (req, res) => {
  const { text, languageName, voiceStyle } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required to perform narrations" });
  }

  try {
    const ai = getGeminiClient();
    
    // Voice styles map: Puck (energetic, high-impact), Zephyr (friendly warm narrator)
    const voiceName = voiceStyle === 'hype' ? 'Puck' : 'Zephyr';

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [
              {
                text: `You are a professional voice actor. Read the following line clearly, expressive, and realistically in the ${languageName} language. Do not output anything other than the spoken audio:\n\n"${text}"`
              }
            ]
          }
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'audio/wav'
        };
      }
      throw new Error("No inline speech synthesis audio data was returned by the TTS model.");
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error in generate-voice endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate voice narration" });
  }
});

// API endpoint for generating individual scene frame images
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const ai = getGeminiClient();
    const result = await retryWithBackoff(async () => {
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

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated by model");
    });

    res.json({ imageUrl: result });
  } catch (error: any) {
    console.error("Error in generate-image endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// API endpoint for Agency Chatbot
app.post('/api/chatbot-chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const ai = getGeminiClient();
    
    const systemInstruction = `
      You are the premium, charming virtual AI cartoon design partner at "AI Cartoon Shorts Creator" — a high-end, world-class design studio that produces viral, Pixar-level visual storyboards, narrations, and custom shorts.
      We specialize in premium story reels, YouTube Kids animations, custom brand mascots, and high-retention social content starting at ₹10,000 ($120 USD) per project.
      
      Our Offerings:
      1. Starter (₹10,000 / $120): 30s premium automated cartoon, HD export, translation narration, 2 revisions.
      2. Professional (₹25,000 / $300): 60s premium cartoon, custom visual style, high fidelity character coherence, 4 revisions.
      3. Agency Partner (₹50,000+ / $600+): Multi-video bulk monthly bundles, dedicated production manager, 4k ultra exports.
      
      Your goal is to converse with prospects in a very professional, witty, intelligent, and warm, conversion-focused startup-grade tone. Encourage them to try our Lifetime Free Creation Tool Workspace (accessible via clicking the top 'Switch to Studio Sandbox' button) or submit a lead response form in the bottom workspace! Keep your replies punchy, elegant, and informative. Keep replies reasonably concise (never too long). Speak in friendly, objective tone. Avoid generic jargon or raw code.
    `;

    // Process last 5 messages for context
    const recentMessages = messages.slice(-5).map(m => `User: ${m.text || m.content}`).join('\n');

    const response = await retryWithBackoff(async () => {
      const completion = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              {
                text: `${systemInstruction}\n\nRecent chat logs:\n${recentMessages}\n\nAgent, generate your premium responsive answer now:`
              }
            ]
          }
        ]
      });
      return completion.text || "I'm happily here to co-create premium cartoon shorts with you! What amazing character ideas or animated scripts should we explore?";
    });

    res.json({ text: response });
  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    res.status(500).json({ error: "Failed to generate agency chatbot reply" });
  }
});

// Bootstrap static flow & Vite support
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();

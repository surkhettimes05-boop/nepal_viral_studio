import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/trends", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const prompt = `Search Google for the MOST RECENT (last 24 hours) viral news stories from Nepal, South Asia, and the world. 
      Current Reference Date: ${new Date().toLocaleDateString()}
      
      Find 6 REAL news stories that would go viral on TikTok for a Nepali youth audience (16-30 years).
      
      CRITICAL AUTHENTICITY RULES:
      1. EXPLICIT LINK: Every story MUST have an EXACT direct URL to the full article. 
      2. NO HOMEPAGES: If you can only find a homepage link, REJECT the story and find another one.
      3. REAL TIMESTAMP: Use the actual published time from the article.
      4. ACCURACY: The description must be a factual summary of the article content.
      
      Categories: 'Politics', 'Tragedy', 'Bizarre', 'Sports', 'Tech', 'Global'.
      Return exactly 6 stories in JSON format.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                headline: { type: Type.STRING },
                source: { type: Type.STRING },
                reason: { type: Type.STRING },
                description: { type: Type.STRING },
                link: { type: Type.STRING },
                publishedAt: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Politics', 'Tragedy', 'Bizarre', 'Sports', 'Tech', 'Global'] }
              },
              required: ["id", "headline", "source", "reason", "description", "link", "publishedAt", "category"]
            }
          }
        }
      });

      const text = result.text;
      if (!text) throw new Error("No response from Gemini");
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Trends Fetch Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-package", async (req, res) => {
    try {
      const { story } = req.body;
      if (!story) {
        return res.status(400).json({ error: "Story is required" });
      }

      const prompt = `Act as a viral TikTok curator for Nepal. Create a viral package for:
      Headline: ${story.headline}
      Source: ${story.source}
      Description: ${story.description}
      Category: ${story.category}

      Return JSON:
      1. viralScore (number, 1-10)
      2. scoreReason (string)
      3. hooks: { nepali, english, bilingual }
      4. imageText: { headline (max 8 words), subtext (max 12 words), emojis (2-3), bgColor (bg-red-600, bg-blue-600, bg-yellow-600, bg-green-600, bg-black) }
      5. caption (under 150 chars, with hook + hashtags + question)
      6. commentBait (2 questions to spark debate)
      7. bestTime (NST time + reason)`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              viralScore: { type: Type.NUMBER },
              scoreReason: { type: Type.STRING },
              hooks: {
                type: Type.OBJECT,
                properties: {
                  nepali: { type: Type.STRING },
                  english: { type: Type.STRING },
                  bilingual: { type: Type.STRING }
                }
              },
              imageText: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  subtext: { type: Type.STRING },
                  emojis: { type: Type.STRING },
                  bgColor: { type: Type.STRING }
                }
              },
              caption: { type: Type.STRING },
              commentBait: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              bestTime: { type: Type.STRING }
            }
          }
        }
      });

      const text = result.text;
      if (!text) throw new Error("No response from Gemini");
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Package Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ViralResult {
  titles: string[];
  description: string;
  tags: string[];
}

export async function analyzeVideo(videoBase64: string, mimeType: string, keywords?: string): Promise<ViralResult> {
  const keywordPrompt = keywords ? `\n\nFocus themes/keywords provided by user: ${keywords}. Incorporate these into the titles and description if relevant.` : "";

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: videoBase64,
            mimeType: mimeType,
          },
        },
        {
          text: `Analyze this video and generate 3 viral, high-click-through-rate titles, 1 SEO-optimized description for YouTube/TikTok (including relevant keywords), and a list of trending hashtags. 

LANGUAGE INSTRUCTIONS:
1. Detect the primary spoken language in the video.
2. If the video is in Hindi, Urdu, or English, the titles and description MUST be written in that same language.
3. For Hindi/Urdu, you can use Roman script (Hinglish/Urdish) or native script (Devanagari/Urdu script) depending on what feels more "viral" for social media trends.

IMPORTANT: The description MUST include a mandatory call-to-action line: "Follow for more" (or its natural translation in the detected language).${keywordPrompt}

Return the results in JSON format.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 viral titles for the video.",
          },
          description: {
            type: Type.STRING,
            description: "SEO-optimized description.",
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Trending hashtags.",
          },
        },
        required: ["titles", "description", "tags"],
      },
    },
  });

  const jsonStr = result.text.trim();
  return JSON.parse(jsonStr) as ViralResult;
}

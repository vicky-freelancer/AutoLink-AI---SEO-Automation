import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSEOContent = async (
  topic: string,
  keywords: string[],
  tone: string = "professional"
): Promise<{ title: string; body: string }> => {
  const ai = getClient();
  
  const prompt = `
    Generate a high-quality, SEO-optimized article snippet for link building.
    Topic: ${topic}
    Keywords: ${keywords.join(", ")}
    Tone: ${tone}
    
    Return the response in JSON format with two keys: "title" and "body".
    The body should be about 200 words, formatted in plain text (no markdown).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return { title: "Error", body: "No response generated." };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const analyzeCompetitorUrl = async (url: string) => {
    // This is a simulation of analyzing a URL since we can't actually scrape in browser
    const ai = getClient();
    const prompt = `
      Analyze this URL for SEO strategy: ${url}. 
      Since you cannot browse the live web, generate a hypothetical but realistic SEO analysis 
      based on the domain name niche. Include potential keywords and backlink opportunities.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text;
};
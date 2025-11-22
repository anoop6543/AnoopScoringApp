import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askRuleAssistant = async (query: string, context?: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the application with a valid Gemini API Key.";
  }

  try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      You are an expert game referee and rule assistant for board games and sports.
      User Query: "${query}"
      ${context ? `Current Game Context: ${context}` : ''}
      
      Provide a concise, clear, and authoritative answer. If the rule depends on specific variations, mention the most common one.
      Keep it under 100 words if possible.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "I couldn't find a specific rule for that. Try rephrasing?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the referee network right now.";
  }
};

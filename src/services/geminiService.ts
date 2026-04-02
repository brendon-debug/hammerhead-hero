import { GoogleGenAI, Type } from "@google/genai";
import { Quest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateUniqueQuest(playerLevel: number): Promise<Partial<Quest>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a unique, short RPG quest for a shark hero at level ${playerLevel}. 
      The quest should be set in "The Shallows", "Coral Cove", "Diamond Peak", or "Dragons Lair".
      Return a JSON object with: title, description, objective, gold (number), exp (number), targetId (string, MUST be either "goblin", "hobgoblin", or "dragon").
      Keep it thematic (ocean, sharks, goblins, treasure).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            objective: { type: Type.STRING },
            gold: { type: Type.NUMBER },
            exp: { type: Type.NUMBER },
            targetId: { type: Type.STRING },
          },
          required: ["title", "description", "objective", "gold", "exp", "targetId"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: `dynamic_${Date.now()}`,
      title: data.title,
      description: data.description,
      objective: data.objective,
      reward: { gold: data.gold, exp: data.exp },
      status: 'available',
      type: 'side',
      targetId: data.targetId,
      targetCount: 1,
      currentCount: 0
    };
  } catch (error) {
    console.error("Failed to generate quest:", error);
    return {
      id: `fallback_${Date.now()}`,
      title: "The Silent Sea",
      description: "Something is wrong in the deep. Investigate.",
      objective: "Explore the depths",
      reward: { gold: 50, exp: 100 },
      status: 'available',
      type: 'side',
    };
  }
}

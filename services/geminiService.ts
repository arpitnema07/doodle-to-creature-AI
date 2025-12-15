import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Re-imagines the drawing as a Creature using gemini-2.5-flash-image
 */
export const reimagineSketch = async (base64Image: string, userPrompt?: string): Promise<string | null> => {
  try {
    // Construct a prompt that enforces Creature/Monster generation
    const basePrompt = "Transform this rough sketch into a living, breathing creature or monster. The output must be a high-quality, polished 2D art illustration. Use the sketch as the structural basis for the creature's body/anatomy.";
    
    // Default to fantasy/vibrant if no style provided, but always keep it a creature.
    const specificInstruction = userPrompt 
      ? `Specific traits or style: ${userPrompt}` 
      : "Style: detailed, vibrant fantasy art.";
    
    const fullPrompt = `${basePrompt} ${specificInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
    });

    // Extract image from response parts
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating creature:", error);
    throw error;
  }
};
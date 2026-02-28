import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function getAI() {
  // @ts-ignore
  const apiKey = (typeof process !== "undefined" && process.env && process.env.API_KEY) || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface MenuItem {
  original: string;
  translated: string;
  description: string;
  ingredients: string[];
  dietary: string[];
  spiceLevel: string;
  category: string;
  price: string;
  allergens: string[];
}

export async function analyzeMenu(imageBase64: string, targetLanguage: string): Promise<MenuItem[]> {
  const ai = getAI();
  const prompt = `You are a menu translator. Analyze this menu image and return ONLY a JSON array (no markdown, no explanation):

[
  {
    "original": "dish name in source language",
    "translated": "dish name in ${targetLanguage}",
    "description": "2-3 sentence description with taste, preparation, origin",
    "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
    "dietary": ["Vegetarian", "Vegan", "Gluten-Free"],
    "spiceLevel": "Mild/Medium/Hot",
    "category": "Appetizer/Main/Dessert/Beverage",
    "price": "$12",
    "allergens": ["dairy", "nuts"]
  }
]

Extract all menu items. If unclear, make best effort. Be culturally accurate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error analyzing menu:", error);
    throw new Error("Failed to analyze menu. Please try again.");
  }
}

export async function enhanceImage(imageBase64: string, prompt: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error enhancing image:", error);
    throw error;
  }
}

export async function generateDishVideo(prompt: string): Promise<string> {
  let ai = getAI();
  try {
    // Check if key is selected for Veo
    if (window.aistudio && await window.aistudio.hasSelectedApiKey() === false) {
       await window.aistudio.openSelectKey();
       // Re-instantiate AI with potentially new key
       ai = getAI();
    }

    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: "720p", // 1080p is slower
          aspectRatio: "16:9",
        },
      });
    } catch (e: any) {
      if (window.aistudio && (e.message?.includes('403') || e.status === 403 || e.message?.includes('PERMISSION_DENIED'))) {
        console.log("Permission denied, prompting for API key selection...");
        await window.aistudio.openSelectKey();
        ai = getAI();
        operation = await ai.models.generateVideos({
          model: "veo-3.1-fast-generate-preview",
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: "720p", // 1080p is slower
            aspectRatio: "16:9",
          },
        });
      } else {
        throw e;
      }
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video generated");

    // Fetch the video content using the API key
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const response = await fetch(videoUri, {
      headers: {
        "x-goog-api-key": apiKey!,
      },
    });

    if (!response.ok) throw new Error("Failed to download video");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

export async function searchDishInfo(dishName: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find detailed information about the dish "${dishName}" including its origin, key ingredients, and cultural significance.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "No information found.";
  } catch (error) {
    console.error("Error searching dish info:", error);
    return "Failed to retrieve information.";
  }
}

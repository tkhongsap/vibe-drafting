
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise summary of the article, no more than 3 sentences.',
    },
    keyInsights: {
      type: Type.ARRAY,
      description: '3-5 key insights or main takeaways from the content, as a list of strings.',
      items: { type: Type.STRING },
    },
    interestingFacts: {
      type: Type.ARRAY,
      description: '2-3 interesting or surprising facts from the content, as a list of strings.',
      items: { type: Type.STRING },
    },
  },
  required: ['summary', 'keyInsights', 'interestingFacts'],
};

export async function analyzeContent(text: string): Promise<GeneratedContent> {
  const prompt = `
    Analyze the following content and provide a structured response. The content is provided below:
    ---
    ${text}
    ---
    Based on the content, generate a concise summary, identify key insights, and list any interesting facts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed object matches the expected structure
    if (
        typeof parsedJson.summary === 'string' &&
        Array.isArray(parsedJson.keyInsights) &&
        Array.isArray(parsedJson.interestingFacts)
    ) {
        return parsedJson as GeneratedContent;
    } else {
        throw new Error("API response does not match the expected format.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the Gemini API.");
  }
}

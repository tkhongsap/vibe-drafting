import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent, ImageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise summary of all the provided content, synthesized into a single cohesive overview.',
    },
    keyInsights: {
      type: Type.ARRAY,
      description: '3-5 key insights or main takeaways from the combined content, as a list of strings.',
      items: { type: Type.STRING },
    },
    interestingFacts: {
      type: Type.ARRAY,
      description: '2-3 interesting or surprising facts drawn from any of the provided content, as a list of strings.',
      items: { type: Type.STRING },
    },
  },
  required: ['summary', 'keyInsights', 'interestingFacts'],
};

interface AnalyzeParams {
    type: 'text' | 'image' | 'url';
    text?: string;
    images?: ImageData[];
    urls?: string[];
    wordCount: number;
}

export async function analyzeContent(params: AnalyzeParams): Promise<GeneratedContent> {
  let model: string;
  let contents: any;

  const basePrompt = `
    Based on the provided content, generate a structured response.
    The response should include:
    1. A concise summary synthesizing all content of about ${params.wordCount} words.
    2. 3-5 key insights or main takeaways from the combined content.
    3. 2-3 interesting or surprising facts from across all content.
  `;

  switch (params.type) {
    case 'text':
      if (!params.text) throw new Error("Text content is missing.");
      model = 'gemini-2.5-pro';
      contents = `Analyze the following text:\n---\n${params.text}\n---\n${basePrompt}`;
      break;
    
    case 'image':
      if (!params.images || params.images.length === 0) {
        throw new Error("Image data is missing for image analysis.");
      }
      model = 'gemini-flash-latest';
      const imageParts = params.images.map(image => ({
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        },
      }));
      
      const textPart = { text: `Analyze these images collectively. ${basePrompt}` };
      contents = { parts: [...imageParts, textPart] };
      break;

    case 'url':
      if (!params.urls || params.urls.length === 0) throw new Error("URL is missing for URL analysis.");
      model = 'gemini-2.5-pro';
      const urlList = params.urls.map(url => `- ${url}`).join('\n');
      contents = `Please extract the main content from the following URLs and then analyze their combined information. URLs:\n${urlList}\n${basePrompt}`;
      break;

    default:
      throw new Error("Invalid analysis type.");
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
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
    if (error instanceof Error && error.message.includes('URL')) {
        throw new Error("Failed to fetch content from one or more URLs. They may be inaccessible or protected.");
    }
    throw new Error("Failed to get a valid response from the Gemini API.");
  }
}
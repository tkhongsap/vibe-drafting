
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedContent, ImageData, TrendTopic, UrlContent, Tone, Style } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "The main content, formatted as a social media post/thread/summary according to the user's request. It should be a concise synthesis of all provided content, adhering to the specified tone and style.",
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

const trendingTopicsSchema = {
  type: Type.OBJECT,
  properties: {
    trends: {
      type: Type.ARRAY,
      description: 'A list of 5 current trending topics.',
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: 'The general category of the trend (e.g., "AI · Trending").'
          },
          title: {
            type: Type.STRING,
            description: 'The specific title of the trend (e.g., "#React19").'
          },
          posts: {
            type: Type.STRING,
            description: 'An estimated number of posts related to the trend (e.g., "50.2K posts").'
          }
        },
        required: ['category', 'title', 'posts']
      }
    }
  },
  required: ['trends']
};

const urlFetchSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'The title of the web page.'
        },
        content: {
            type: Type.STRING,
            description: 'The main textual content extracted from the web page, stripped of navigation, ads, and footers.'
        }
    },
    required: ['title', 'content']
};

const hashtagsSchema = {
  type: Type.OBJECT,
  properties: {
    hashtags: {
      type: Type.ARRAY,
      description: 'A list of 3-5 relevant social media hashtags as strings, each starting with a #.',
      items: { type: Type.STRING },
    },
  },
  required: ['hashtags'],
};

interface AnalyzeParams {
    type: 'text' | 'image' | 'url';
    text?: string;
    images?: ImageData[];
    urls?: UrlContent[];
    tone: Tone;
    style: Style;
}

async function generateHashtags(summary: string, keyInsights: string[]): Promise<string[]> {
  const model = 'gemini-2.5-flash';
  const contentToAnalyze = `Summary: ${summary}\nKey Insights: ${keyInsights.join('\n- ')}`;
  const prompt = `Based on the following content, generate 3-5 highly relevant and popular social media hashtags. The hashtags should be concise, lowercase, and directly related to the main topics. Each hashtag MUST start with the # symbol.
  
  Content:\n---\n${contentToAnalyze}\n---\n
  
  Return the hashtags in the specified JSON format. Example: ["#ai", "#technology", "#innovation"]`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: hashtagsSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (parsedJson.hashtags && Array.isArray(parsedJson.hashtags)) {
      return parsedJson.hashtags.map((tag: string) => 
        tag.startsWith('#') ? tag : `#${tag}`
      );
    } else {
      console.warn("Hashtag generation response was not in the expected format.");
      return [];
    }
  } catch (error) {
    console.error("Error generating hashtags:", error);
    // Return empty array to not break the main flow
    return [];
  }
}

export async function fetchUrlContent(url: string): Promise<{ title: string; content: string }> {
    const model = 'gemini-2.5-pro';
    const prompt = `Extract the title and the main article text from the following URL: ${url}. Please focus on the primary content and ignore boilerplate like headers, footers, and navigation menus.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: urlFetchSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        if (parsedJson.title && parsedJson.content) {
            return parsedJson;
        } else {
            throw new Error("Invalid JSON structure from API.");
        }
    } catch (error) {
        console.error(`Error fetching content for URL ${url}:`, error);
        throw new Error(`Failed to fetch and parse content for the URL. It might be inaccessible.`);
    }
}

export async function getTrendingTopics(): Promise<TrendTopic[]> {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Generate a list of exactly 5 current and diverse trending topics suitable for a social media "What's happening" section.
    Topics should cover technology, business, AI, and marketing.
    For each topic, provide a category, a concise title (often a hashtag), and a realistic, estimated number of posts.
    Follow the JSON schema exactly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: trendingTopicsSchema,
        temperature: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson.trends && Array.isArray(parsedJson.trends)) {
      return parsedJson.trends as TrendTopic[];
    } else {
      throw new Error("API response for trends is not in the expected format.");
    }
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    throw new Error("Failed to fetch trending topics from the Gemini API.");
  }
}

export async function analyzeContent(params: AnalyzeParams): Promise<GeneratedContent> {
  let model: string;
  let contents: any;
  const { type, tone, style } = params;

  const basePrompt = `
    You are an expert social media content creator. Your task is to analyze the provided content and generate a structured response for a social media post based on the specified style.
    
    **Instructions:**
    1.  **Style & Formatting:**
        - Your output must be a **'${style}'**.
        - The tone must be **'${tone}'**.
        - **Length:** Determine the optimal length based on the platform. LinkedIn posts can be longer and more detailed, while Twitter posts must be concise.
    2.  **Specific Style Guidelines:**
        - If the style is **'LinkedIn'**: Write in a professional, engaging manner. Use whitespace, emojis, or bullet points to improve readability. End with a question or a call-to-action to encourage comments.
        - If the style is **'Twitter'**: Keep it short, punchy, and well under the character limit. Use hashtags effectively.
        - If the style is **'Thread'**: Create a series of connected, numbered tweets (e.g., 1/n). Start with a strong hook and end with a summary or call-to-action. Format the entire thread as a single string, with each tweet separated by "\\n\\n---\\n\\n".
        - If the style is **'IG'**: Craft an engaging and visually-driven caption for an Instagram post. Use relevant emojis, and place most hashtags at the end for a clean look.
    3.  **Output:** Based on all the provided content, generate the following in the required JSON format:
        - **summary:** The main content, formatted according to the instructions above.
        - **keyInsights:** 3-5 key insights or main takeaways from the combined content.
        - **interestingFacts:** 2-3 interesting or surprising facts from across all content.
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
      const urlList = params.urls.map(u => `- ${u.url}`).join('\n');
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
        const hashtags = await generateHashtags(parsedJson.summary, parsedJson.keyInsights);
        return {
            ...parsedJson,
            hashtags,
        } as GeneratedContent;
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

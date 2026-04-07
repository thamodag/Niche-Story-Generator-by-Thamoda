import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  CharacterOption, 
  ImagePrompt, 
  TopicOption, 
  ScenePrompt, 
  Country, 
  Niche, 
  NewsItem, 
  MedicineItem,
  MultiAnglePrompts
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || "" });
const modelPro = "gemini-3.1-pro-preview";
const modelFlash = "gemini-3-flash-preview";
const modelTTS = "gemini-2.5-flash-preview-tts";

export const fetchViralNews = async (country: Country, language: string): Promise<NewsItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Find 5 currently viral, trending, or highly engaging lifestyle/human-interest news stories in ${country.name}. 
    Focus on stories that would perform well on Facebook and appeal to a broad audience.
    
    IMPORTANT: Provide the title and summary in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            summary: { type: Type.STRING, description: `Summary in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            summaryEnglish: { type: Type.STRING, description: "Summary translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            summarySinhala: { type: Type.STRING, description: "Summary translated to Sinhala" },
            sourceUrl: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
          },
          required: ["id", "title", "summary", "titleEnglish", "summaryEnglish", "titleSinhala", "summarySinhala", "sourceUrl", "viralScore"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse news JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchAdviceTopics = async (country: Country, language: string): Promise<NewsItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Identify 5 common modern life problems, dilemmas, or social issues in ${country.name} that people often seek advice for. 
    Examples: loneliness, family conflicts, digital addiction, lost traditions, relationship issues.
    Format as news-like items for the UI.
    
    IMPORTANT: Provide the title and summary in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            summary: { type: Type.STRING, description: `Summary in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            summaryEnglish: { type: Type.STRING, description: "Summary translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            summarySinhala: { type: Type.STRING, description: "Summary translated to Sinhala" },
            sourceUrl: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
          },
          required: ["id", "title", "summary", "titleEnglish", "summaryEnglish", "titleSinhala", "summarySinhala", "sourceUrl", "viralScore"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse advice JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchHistoricMedicine = async (country: Country, language: string): Promise<MedicineItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Find 5 traditional, historic, or cultural home remedies/medicines from ${country.name}. 
    Focus on remedies that could be presented by an elderly person (like a grandmother/grandfather) from that culture. 
    Examples: herbal teas, ancient book remedies, traditional healing practices.
    
    IMPORTANT: Provide the title and remedy in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            remedy: { type: Type.STRING, description: `Remedy in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            remedyEnglish: { type: Type.STRING, description: "Remedy translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            remedySinhala: { type: Type.STRING, description: "Remedy translated to Sinhala" },
            culturalContext: { type: Type.STRING },
            historicalSource: { type: Type.STRING },
          },
          required: ["id", "title", "remedy", "titleEnglish", "remedyEnglish", "titleSinhala", "remedySinhala", "culturalContext", "historicalSource"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse medicine JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchFolklore = async (country: Country, language: string): Promise<MedicineItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Find 5 ancient legends, myths, or folklore stories from ${country.name}. 
    Focus on stories that carry a moral lesson or cultural wisdom, suitable for an elderly storyteller.
    
    IMPORTANT: Provide the title and story (remedy field) in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            remedy: { type: Type.STRING, description: `Story in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            remedyEnglish: { type: Type.STRING, description: "Story translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            remedySinhala: { type: Type.STRING, description: "Story translated to Sinhala" },
            culturalContext: { type: Type.STRING },
            historicalSource: { type: Type.STRING },
          },
          required: ["id", "title", "remedy", "titleEnglish", "remedyEnglish", "titleSinhala", "remedySinhala", "culturalContext", "historicalSource"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse folklore JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchTraditionalCrafts = async (country: Country, language: string): Promise<MedicineItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Find 5 traditional heritage crafts or artisan skills from ${country.name}. 
    Focus on crafts that are fading or require deep traditional knowledge (e.g., pottery, weaving, wood carving).
    
    IMPORTANT: Provide the title and description (remedy field) in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            remedy: { type: Type.STRING, description: `Description in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            remedyEnglish: { type: Type.STRING, description: "Description translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            remedySinhala: { type: Type.STRING, description: "Description translated to Sinhala" },
            culturalContext: { type: Type.STRING },
            historicalSource: { type: Type.STRING },
          },
          required: ["id", "title", "remedy", "titleEnglish", "remedyEnglish", "titleSinhala", "remedySinhala", "culturalContext", "historicalSource"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse crafts JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchArmyTopics = async (country: Country, language: string): Promise<NewsItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Find 5 currently trending or significant military, defense, or national security stories related to ${country.name}. 
    Focus on stories about national pride, history, modern updates, or human-interest stories within the military.
    
    IMPORTANT: Provide the title and summary in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            summary: { type: Type.STRING, description: `Summary in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            summaryEnglish: { type: Type.STRING, description: "Summary translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            summarySinhala: { type: Type.STRING, description: "Summary translated to Sinhala" },
            sourceUrl: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
          },
          required: ["id", "title", "summary", "titleEnglish", "summaryEnglish", "titleSinhala", "summarySinhala", "sourceUrl", "viralScore"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse army JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const fetchPodcastTopics = async (country: Country, language: string): Promise<NewsItem[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Identify 5 highly engaging, controversial, or thought-provoking topics in ${country.name} that would make for an excellent podcast discussion. 
    Focus on social trends, cultural shifts, or interesting local debates.
    
    IMPORTANT: Provide the title and summary in ${language} (using proper ${language} script/Unicode) AND provide an English translation AND a Sinhala translation for both.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: `Title in ${language}` },
            summary: { type: Type.STRING, description: `Summary in ${language}` },
            titleEnglish: { type: Type.STRING, description: "Title translated to English" },
            summaryEnglish: { type: Type.STRING, description: "Summary translated to English" },
            titleSinhala: { type: Type.STRING, description: "Title translated to Sinhala" },
            summarySinhala: { type: Type.STRING, description: "Summary translated to Sinhala" },
            sourceUrl: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
          },
          required: ["id", "title", "summary", "titleEnglish", "summaryEnglish", "titleSinhala", "summarySinhala", "sourceUrl", "viralScore"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse podcast JSON:", response.text);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
};

export const generateCharacterForNiche = async (niche: Niche, country: Country, context: string): Promise<CharacterOption> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Generate a detailed elderly character (60-80 years old) from ${country.name} who would be the perfect storyteller/presenter for this ${niche.title} content: "${context}".
    The character should feel authentic to the local culture.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          visualDetails: { type: Type.STRING },
        },
        required: ["id", "title", "description", "visualDetails"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse character JSON:", response.text);
    throw new Error("The AI returned an invalid format for the character profile. Please try again.");
  }
};

export const generateMultiAnglePrompts = async (character: CharacterOption, context: string): Promise<MultiAnglePrompts> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Generate 4 ultra-realistic image prompts for different camera angles of this character: ${character.title} (${character.visualDetails}).
    Context: ${context}.
    Angles needed: 
    1. Main (Medium Portrait, looking directly at camera)
    2. Close-Up (Focus on facial details/emotions)
    3. Side Angle (Profile view, looking slightly away or at an object)
    4. Action Shot (Showing the character performing a task related to the context, e.g., holding a book, pouring tea).
    
    Style: Hyperrealistic, 8K, documentary photography.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          main: { type: Type.STRING },
          closeUp: { type: Type.STRING },
          sideAngle: { type: Type.STRING },
          actionShot: { type: Type.STRING },
        },
        required: ["main", "closeUp", "sideAngle", "actionShot"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse multi-angle prompts JSON:", response.text);
    throw new Error("The AI returned an invalid format for the visual prompts. Please try again.");
  }
};

export const generateImagePrompt = async (promptText: string): Promise<ImagePrompt> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Refine this into a FULL ultra-detailed image prompt: "${promptText}". 
    Follow the SYSTEM RULES:
    - Elderly (60-80 years old)
    - Looking DIRECTLY into camera (if main shot)
    - Countryside/rural/calm vibes
    - Golden hour or soft natural light
    - Style: Hyperrealistic, documentary portrait, 8K quality.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING },
          negative_prompt: { type: Type.STRING },
          settings: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.INTEGER },
              cfg_scale: { type: Type.NUMBER },
              sampler: { type: Type.STRING },
              resolution: { type: Type.STRING },
              clip_skip: { type: Type.INTEGER },
              model: { type: Type.STRING },
              aspect_ratio: { type: Type.STRING },
              midjourney_flag: { type: Type.STRING },
            },
            required: ["steps", "cfg_scale", "sampler", "resolution", "clip_skip", "model", "aspect_ratio", "midjourney_flag"],
          },
        },
        required: ["prompt", "negative_prompt", "settings"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse image prompt JSON:", response.text);
    throw new Error("The AI returned an invalid format for the refined image prompt. Please try again.");
  }
};

export interface GeneratedScript {
  script: string;
  scriptEnglish: string;
  scriptSinhala: string;
}

export const generateScript = async (character: CharacterOption, context: string, country: Country, niche: Niche, language: string): Promise<GeneratedScript> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Write a 1-MINUTE SCRIPT in the character's voice (${character.title}) from ${country.name} about this ${niche.title} topic: "${context}".
    
    LANGUAGE: The script MUST be written in ${language} (using proper ${language} script/Unicode).
    
    IMPORTANT: Also provide a full English translation AND a full Sinhala translation of the script.
    
    CHARACTER PERSONA:
    ${character.description}
    
    NICHE SPECIFIC INSTRUCTIONS:
    - If Medicine: Explain the remedy clearly, how to prepare it, and why it works according to tradition.
    - If News: Share the story with a personal perspective, how it affects the community.
    - If Folklore: Tell the core of the legend with its moral lesson.
    - If Crafts: Describe the technique and the feeling of the materials.

    GENERAL RULES:
    - 130–150 words
    - First person, direct speech
    - Tone: Real, hard life, NOT motivational, NOT poetic, rough edges, unhurried
    - Structure: 
      1. Opening: Specific memory related to the topic (30-35 words)
      2. Middle: The core content (remedy/story/news) + personal experience (60-65 words)
      3. Closing: A POWERFUL CLOSING THOUGHT. Leave the audience with a piece of timeless wisdom, a heartfelt reflection, or a "good thing" that resonates globally and visually. This should be the most impactful part of the script. (40-50 words)
    - BANNED: "Life is a journey", "I've learned that", "Trust the process", etc.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          script: { type: Type.STRING, description: `Script in ${language}` },
          scriptEnglish: { type: Type.STRING, description: "Script translated to English" },
          scriptSinhala: { type: Type.STRING, description: "Script translated to Sinhala" },
        },
        required: ["script", "scriptEnglish", "scriptSinhala"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse script JSON:", response.text);
    return { script: response.text || "", scriptEnglish: "", scriptSinhala: "" };
  }
};

export const generateVoiceOver = async (text: string, language: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelTTS,
      contents: [{ parts: [{ text: `Speak this text in ${language} with an elderly, warm, and authentic tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is often good for older voices
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (e) {
    console.error("Failed to generate voiceover:", e);
    return null;
  }
};

export const recommendSceneCount = async (script: string): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: `Analyze this script and recommend the OPTIMAL number of scenes (between 3 and 10) to tell this story effectively without missing details or being too long.
      
      Script: ${script}
      
      Return ONLY a single number.`,
    });
    const count = parseInt(response.text?.trim() || "5");
    return isNaN(count) ? 5 : Math.max(3, Math.min(10, count));
  } catch (e) {
    console.error("Failed to recommend scene count:", e);
    return 5;
  }
};

export const generateScenePrompts = async (character: CharacterOption, script: string, sceneCount: number = 5): Promise<ScenePrompt[]> => {
  const response = await ai.models.generateContent({
    model: modelFlash,
    contents: `Generate EXACTLY ${sceneCount} scene-by-scene video prompts for this script. 
    Character: ${character.title} (${character.visualDetails})
    Script: ${script}
    
    RETENTION HOOK: The FIRST scene MUST be designed as a powerful retention hook. It should be visually arresting, emotionally charged, or mysterious to keep the viewer watching past the first 3 seconds.
    
    PACING: Slow, unhurried, words land one at a time.
    CLIP CONSTRAINT: Exactly 8 seconds per clip.
    
    For each scene, provide:
    - SCRIPT LINE (with [PAUSE], [SLOW], [HOLD] marks)
    - CHARACTER DESCRIPTION (Full, fresh every scene, do not de-age)
    - EXPRESSION & MICRO-MOVEMENT
    - BODY LANGUAGE
    - CAMERA (LOCKED OFF, VERY SLOW PUSH IN, etc.)
    - ENVIRONMENT
    - VOICE DIRECTION (Pace, Tone, Texture, Delivery)
    - AUDIO (Ambient only)
    - IMAGE PROMPT (A full, detailed image prompt for this specific scene. It MUST capture the EMOTIONAL MOOD, specific FEELINGS of the character, lighting, colors, and camera angle. Describe the scene as a high-quality cinematic photograph.)
    - SCRIPT LINE ENGLISH (A full English translation of the scriptLine for this scene)
    - SCRIPT LINE SINHALA (A full Sinhala translation of the scriptLine for this scene)
    - ESTIMATED DURATION (8 seconds)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            startTime: { type: Type.STRING },
            scriptLine: { type: Type.STRING },
            scriptLineEnglish: { type: Type.STRING },
            scriptLineSinhala: { type: Type.STRING },
            characterDescription: { type: Type.STRING },
            expression: { type: Type.STRING },
            bodyLanguage: { type: Type.STRING },
            camera: { type: Type.STRING },
            environment: { type: Type.STRING },
            voiceDirection: {
              type: Type.OBJECT,
              properties: {
                pace: { type: Type.STRING },
                tone: { type: Type.STRING },
                texture: { type: Type.STRING },
                delivery: { type: Type.STRING },
              },
              required: ["pace", "tone", "texture", "delivery"],
            },
            audio: { type: Type.STRING },
            duration: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["sceneNumber", "startTime", "scriptLine", "scriptLineEnglish", "scriptLineSinhala", "characterDescription", "expression", "bodyLanguage", "camera", "environment", "voiceDirection", "audio", "duration", "imagePrompt"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

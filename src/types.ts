export interface Country {
  name: string;
  code: string;
  languages: string[];
}

export interface Niche {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  titleEnglish?: string;
  summaryEnglish?: string;
  titleSinhala?: string;
  summarySinhala?: string;
  sourceUrl: string;
  viralScore: number;
}

export interface MedicineItem {
  id: string;
  title: string;
  remedy: string;
  titleEnglish?: string;
  remedyEnglish?: string;
  titleSinhala?: string;
  remedySinhala?: string;
  culturalContext: string;
  historicalSource: string;
}

export interface CharacterOption {
  id: number;
  title: string;
  description: string;
  visualDetails: string;
}

export interface MultiAnglePrompts {
  main: string;
  closeUp: string;
  sideAngle: string;
  actionShot: string;
}

export interface ImagePrompt {
  prompt: string;
  negative_prompt: string;
  settings: {
    steps: number;
    cfg_scale: number;
    sampler: string;
    resolution: string;
    clip_skip: number;
    model: string;
    aspect_ratio: string;
    midjourney_flag: string;
  };
}

export interface TopicOption {
  id: number;
  title: string;
  description: string;
}

export interface ScenePrompt {
  sceneNumber: number;
  startTime: string;
  scriptLine: string;
  characterDescription: string;
  expression: string;
  bodyLanguage: string;
  camera: string;
  environment: string;
  voiceDirection: {
    pace: string;
    tone: string;
    texture: string;
    delivery: string;
  };
  audio: string;
  duration: string;
  imagePrompt: string;
  scriptLineEnglish?: string;
  scriptLineSinhala?: string;
  selected?: boolean;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  country: Country;
  language: string;
  niche: Niche;
  content: NewsItem | MedicineItem;
  character: CharacterOption;
  script: string;
  scriptEnglish?: string;
  scriptSinhala?: string;
  scenes: ScenePrompt[];
}

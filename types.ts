export interface GeneratedContent {
  summary: string;
  keyInsights: string[];
  interestingFacts: string[];
}

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface TrendTopic {
  category: string;
  title: string;
  posts: string;
}

export interface User {
  name: string;
  handle: string;
  avatarUrl?: string;
}

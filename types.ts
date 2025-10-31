// FIX: Added 'View' type to be shared across components.
export type View = 'home' | 'explore' | 'notifications' | 'history' | 'profile';

export interface GeneratedContent {
  summary: string;
  keyInsights: string[];
  interestingFacts: string[];
}

export interface SavedContent extends GeneratedContent {
  id: string;
  createdAt: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface UrlContent {
  url: string;
  status: 'loading' | 'success' | 'error';
  title?: string;
  content?: string;
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
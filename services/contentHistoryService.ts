import type { GeneratedContent, SavedContent } from '../types';

const HISTORY_STORAGE_KEY = 'content_studio_history';

export const contentHistoryService = {
  getHistory: (): SavedContent[] => {
    try {
      const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyJson) {
        // Sort by most recent first
        return (JSON.parse(historyJson) as SavedContent[]).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return [];
    } catch (error) {
      console.error("Could not retrieve history from localStorage", error);
      return [];
    }
  },

  saveContent: (content: GeneratedContent): SavedContent => {
    const history = contentHistoryService.getHistory();
    const newSavedContent: SavedContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedHistory = [newSavedContent, ...history];
    
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Could not save to localStorage", error);
    }

    return newSavedContent;
  },
  
  deleteContent: (id: string): void => {
    let history = contentHistoryService.getHistory();
    history = history.filter(item => item.id !== id);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Could not update localStorage", error);
    }
  },
};

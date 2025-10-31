
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ContentInput } from './components/ContentInput';
import { ContentOutput } from './components/ContentOutput';
import { analyzeContent } from './services/geminiService';
import type { GeneratedContent } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some content to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await analyzeContent(inputText);
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      setError('Failed to analyze content. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="w-full h-full">
            <ContentInput 
              inputText={inputText}
              setInputText={setInputText}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
        </div>
        <div className="w-full h-full">
            <ContentOutput 
              content={generatedContent}
              isLoading={isLoading}
              error={error}
            />
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;

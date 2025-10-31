import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ContentInput } from './components/ContentInput';
import { ContentOutput } from './components/ContentOutput';
import { analyzeContent } from './services/geminiService';
import type { GeneratedContent } from './types';

export type InputType = 'text' | 'image' | 'url';

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [inputType, setInputType] = useState<InputType>('text');
  const [inputText, setInputText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [wordCount, setWordCount] = useState<number>(150);

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAnalyzeDisabled = () => {
    if (isLoading) return true;
    switch (inputType) {
      case 'text':
        return !inputText.trim();
      case 'image':
        return !imageData;
      case 'url':
        return !url.trim();
      default:
        return true;
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (isAnalyzeDisabled()) {
      setError('Please provide valid input to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      let result: GeneratedContent;
      switch (inputType) {
        case 'text':
          result = await analyzeContent({ type: 'text', text: inputText, wordCount });
          break;
        case 'image':
          if (!imageData) throw new Error("Image data not found.");
          result = await analyzeContent({ type: 'image', imageUrl: imageData.base64, imageMimeType: imageData.mimeType, wordCount });
          break;
        case 'url':
          result = await analyzeContent({ type: 'url', url: url, wordCount });
          break;
        default:
          throw new Error("Invalid input type");
      }
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to analyze content. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, inputType, imageData, url, wordCount]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="w-full h-full">
            <ContentInput 
              inputType={inputType}
              setInputType={setInputType}
              inputText={inputText}
              setInputText={setInputText}
              url={url}
              setUrl={setUrl}
              imageData={imageData}
              setImageData={setImageData}
              wordCount={wordCount}
              setWordCount={setWordCount}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              isAnalyzeDisabled={isAnalyzeDisabled()}
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

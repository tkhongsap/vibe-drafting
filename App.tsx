import React, { useState, useCallback } from 'react';
import { ContentInput } from './components/ContentInput';
import { ContentOutput } from './components/ContentOutput';
import { analyzeContent } from './services/geminiService';
import type { GeneratedContent } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';

export type InputType = 'text' | 'image' | 'url';

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [inputType, setInputType] = useState<InputType>('text');
  const [inputText, setInputText] = useState<string>('');
  const [urls, setUrls] = useState<string[]>([]);
  const [imageData, setImageData] = useState<ImageData[]>([]);
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
        return imageData.length === 0;
      case 'url':
        return urls.length === 0;
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
          if (imageData.length === 0) throw new Error("Image data not found.");
          result = await analyzeContent({ type: 'image', images: imageData, wordCount });
          break;
        case 'url':
          result = await analyzeContent({ type: 'url', urls: urls, wordCount });
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
  }, [inputText, inputType, imageData, urls, wordCount]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex justify-center">
      <div className="w-full max-w-7xl flex">
        <LeftSidebar />
        <div className="flex-grow flex-shrink-0 w-full max-w-[600px] border-x border-slate-700">
            <header className="sticky top-0 z-10 p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Home</h1>
            </header>
            <main>
                <div className="p-4 border-b border-slate-700">
                    <ContentInput 
                      inputType={inputType}
                      setInputType={setInputType}
                      inputText={inputText}
                      setInputText={setInputText}
                      urls={urls}
                      setUrls={setUrls}
                      imageData={imageData}
                      setImageData={setImageData}
                      wordCount={wordCount}
                      setWordCount={setWordCount}
                      onAnalyze={handleAnalyze}
                      isLoading={isLoading}
                      isAnalyzeDisabled={isAnalyzeDisabled()}
                    />
                </div>
                <div className="min-h-[50vh]">
                    <ContentOutput 
                      content={generatedContent}
                      isLoading={isLoading}
                      error={error}
                    />
                </div>
            </main>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

export default App;
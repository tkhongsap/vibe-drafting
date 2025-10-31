import React, { useState, useCallback, useEffect } from 'react';
import { ContentInput } from './components/ContentInput';
import { ContentOutput } from './components/ContentOutput';
import { analyzeContent } from './services/geminiService';
// FIX: Import 'View' type from the central types file.
import type { GeneratedContent, User, View, UrlContent } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { LandingPage } from './components/LandingPage';
import { authService } from './services/authService';
import { HistoryView } from './components/HistoryView';

export type InputType = 'text' | 'image' | 'url';
// FIX: Removed 'View' type definition to avoid circular dependencies and centralize types. It is now defined in types.ts.


export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');

  const [inputType, setInputType] = useState<InputType>('text');
  const [inputText, setInputText] = useState<string>('');
  const [urls, setUrls] = useState<UrlContent[]>([]);
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [wordCount, setWordCount] = useState<number>(150);

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
  };

  const isAnalyzeDisabled = () => {
    if (isLoading) return true;
    switch (inputType) {
      case 'text':
        return !inputText.trim();
      case 'image':
        return imageData.length === 0;
      case 'url':
        return urls.length === 0 || urls.every(u => u.status === 'error');
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
    setCurrentView('home');

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

  if (!currentUser) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex justify-center">
      <div className="w-full max-w-7xl flex">
        <LeftSidebar 
            user={currentUser} 
            onLogout={handleLogout}
            currentView={currentView}
            setView={setCurrentView}
        />
        <div className="flex-grow flex-shrink-0 w-full max-w-[600px] border-x border-slate-700">
            <header className="sticky top-0 z-10 p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
                <h1 className="text-xl font-bold capitalize">{currentView}</h1>
            </header>
            <main>
                {currentView === 'home' ? (
                    <>
                        <div className="p-4 border-b border-slate-700">
                            <ContentInput
                              user={currentUser}
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
                    </>
                ) : currentView === 'history' ? (
                     <HistoryView />
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        <h2 className="text-2xl font-bold text-slate-300 mb-2">Coming Soon!</h2>
                        <p>The "{currentView}" section is currently under construction.</p>
                    </div>
                )}
            </main>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

export default App;
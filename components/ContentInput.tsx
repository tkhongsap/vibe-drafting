import React, { useCallback, useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { InputType } from '../App';
import type { ImageData, User } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ContentInputProps {
  user: User;
  inputType: InputType;
  setInputType: (type: InputType) => void;
  inputText: string;
  setInputText: (text: string) => void;
  urls: string[];
  setUrls: (urls: string[]) => void;
  imageData: ImageData[];
  setImageData: React.Dispatch<React.SetStateAction<ImageData[]>>;
  wordCount: number;
  setWordCount: (count: number) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  isAnalyzeDisabled: boolean;
}


const IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean, 'aria-label': string }> = ({ children, onClick, active, ...props }) => (
    <button onClick={onClick} className={`p-2 rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors ${active ? 'bg-blue-500/10' : ''}`} {...props}>
        {children}
    </button>
);

const ImageUploader: React.FC<{ imageData: ImageData[]; setImageData: React.Dispatch<React.SetStateAction<ImageData[]>>; isLoading: boolean; }> = ({ imageData, setImageData, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback((files: FileList) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result?.toString().split(',')[1];
                if (base64) {
                    setImageData(prev => [...prev, { base64, mimeType: file.type, name: file.name }]);
                }
            };
            reader.readAsDataURL(file);
        });
    }, [setImageData]);

    const handleRemoveImage = (index: number) => {
        setImageData(prev => prev.filter((_, i) => i !== index));
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    return (
        <div className="flex-grow flex flex-col min-h-[200px]">
            {imageData.length > 0 && (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2 overflow-y-auto max-h-48 p-1">
                    {imageData.map((img, index) => (
                        <div key={index} className="relative group">
                            <img src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-20 object-cover rounded-md" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                disabled={isLoading}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >
                                &#x2715;
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-slate-800' : 'border-slate-700'}`}
            >
                <p className="text-slate-500 mb-2 text-sm">Drag & drop or</p>
                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-600">
                    <span>Select files</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} disabled={isLoading} />
                </label>
            </div>
        </div>
    );
};

const UrlInput: React.FC<{ urls: string[]; setUrls: (urls: string[]) => void; isLoading: boolean; }> = ({ urls, setUrls, isLoading }) => {
    const [currentUrl, setCurrentUrl] = useState('');

    const handleAddUrl = () => {
        const urlToAdd = currentUrl.trim();
        if (!urlToAdd) return;
        setUrls([...urls, urlToAdd]);
        setCurrentUrl('');
    };

    const handleRemoveUrl = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    return (
        <div className="flex-grow flex flex-col min-h-[200px]">
            <div className="mb-2">
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={currentUrl}
                        onChange={(e) => setCurrentUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
                        placeholder="https://example.com"
                        className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleAddUrl} 
                        disabled={isLoading || !currentUrl.trim()} 
                        className="shrink-0 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className="flex-grow space-y-2 overflow-y-auto max-h-60 p-1">
                {urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                        <span className="text-slate-400 text-sm truncate pr-2">{url}</span>
                        <button onClick={() => handleRemoveUrl(index)} disabled={isLoading} className="text-red-500 hover:text-red-400 text-lg">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ContentInput: React.FC<ContentInputProps> = (props) => {
  const { 
    user, inputType, setInputType, inputText, setInputText, urls, setUrls, imageData, setImageData,
    wordCount, setWordCount, onAnalyze, isLoading, isAnalyzeDisabled 
  } = props;
  
  const [loadingText, setLoadingText] = useState('Analyzing...');
  const loadingMessages = [
    "Crafting hook...",
    "Finding insights...",
    "Polishing post...",
    "Making it viral...",
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      let i = 0;
      setLoadingText(loadingMessages[i]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLoading]);

   const renderInputArea = () => {
    switch(inputType) {
        case 'text':
            return (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                rows={4}
                disabled={isLoading}
              />
            );
        case 'image':
            return <ImageUploader imageData={imageData} setImageData={setImageData} isLoading={isLoading}/>;
        case 'url':
            return <UrlInput urls={urls} setUrls={setUrls} isLoading={isLoading} />;
        default:
            return null;
    }
  }

  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-full flex-shrink-0" aria-label="User avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col">
          {renderInputArea()}
          <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                  <IconButton onClick={() => setInputType('text')} active={inputType === 'text'} aria-label="Switch to Text Input">
                    <DocumentTextIcon className="w-6 h-6" />
                  </IconButton>
                  <IconButton onClick={() => setInputType('image')} active={inputType === 'image'} aria-label="Switch to Image Input">
                    <PhotoIcon className="w-6 h-6" />
                  </IconButton>
                  <IconButton onClick={() => setInputType('url')} active={inputType === 'url'} aria-label="Switch to URL Input">
                    <LinkIcon className="w-6 h-6" />
                  </IconButton>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="word-count" className="text-sm font-medium text-slate-400">
                        Words
                    </label>
                    <input
                        type="number"
                        id="word-count"
                        value={wordCount}
                        onChange={(e) => setWordCount(Math.max(50, Math.min(1000, Number(e.target.value))))}
                        min="50" max="1000" step="10"
                        className="w-20 bg-slate-800 border border-slate-700 rounded-md p-1 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzeDisabled}
                    className="flex items-center justify-center px-6 py-2 border border-transparent text-base font-bold rounded-full text-white bg-blue-500 hover:bg-blue-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? loadingText : 'Post'}
                </button>
              </div>
          </div>
      </div>
    </div>
  );
};

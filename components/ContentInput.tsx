import React, { useCallback, useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { InputType } from '../App';
import type { ImageData } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ContentInputProps {
  inputType: InputType;
  setInputType: (type: InputType) => void;
  inputText: string;
  setInputText: (text: string) => void;
  urls: string[];
  setUrls: (urls: string[]) => void;
  imageData: ImageData[];
  setImageData: (data: ImageData[]) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  isAnalyzeDisabled: boolean;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
            active
                ? 'bg-slate-800/50 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);

const ImageUploader: React.FC<{ imageData: ImageData[]; setImageData: (data: ImageData[]) => void; isLoading: boolean; }> = ({ imageData, setImageData, isLoading }) => {
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
        <div className="flex-grow flex flex-col">
            {imageData.length > 0 && (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 overflow-y-auto max-h-60 p-1">
                    {imageData.map((img, index) => (
                        <div key={index} className="relative group">
                            <img src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-24 object-cover rounded-md shadow-lg" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                disabled={isLoading}
                                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 transition-colors duration-200 ${isDragging ? 'border-cyan-500 bg-slate-800' : 'border-slate-700'}`}
            >
                <PhotoIcon className="w-12 h-12 text-slate-500 mb-2" />
                <p className="text-slate-400 mb-2">Drag & drop images here</p>
                <p className="text-slate-500 text-sm mb-4">or</p>
                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors duration-200">
                    <span>Select files</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} disabled={isLoading} />
                </label>
            </div>
        </div>
    );
};

const UrlInput: React.FC<{ urls: string[]; setUrls: (urls: string[]) => void; isLoading: boolean; }> = ({ urls, setUrls, isLoading }) => {
    const [currentUrl, setCurrentUrl] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleAddUrl = async () => {
        const urlToAdd = currentUrl.trim();
        if (!urlToAdd) return;

        if (urls.some(url => url.toLowerCase() === urlToAdd.toLowerCase())) {
            setValidationError('This URL has already been added.');
            return;
        }

        setIsValidating(true);
        setValidationError(null);

        try {
            // 1. Basic format check
            new URL(urlToAdd);
        } catch (_) {
            setValidationError('Invalid URL format. Please enter a complete URL (e.g., https://example.com).');
            setIsValidating(false);
            return;
        }

        try {
            // 2. Accessibility check (best effort due to CORS)
            // 'no-cors' mode can detect network errors (like DNS failure)
            // but won't reveal status codes for successful requests.
            await fetch(urlToAdd, { method: 'HEAD', mode: 'no-cors' });
            
            setUrls([...urls, urlToAdd]);
            setCurrentUrl('');
        } catch (error) {
            console.error('URL validation fetch error:', error);
            setValidationError('URL seems to be inaccessible. Please check the address and your connection.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveUrl = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    return (
        <div className="flex-grow flex flex-col">
            <div className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={currentUrl}
                        onChange={(e) => {
                            setCurrentUrl(e.target.value);
                            if (validationError) setValidationError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isValidating) {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                        placeholder="https://example.com/article"
                        className="flex-grow w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        disabled={isLoading || isValidating}
                        aria-invalid={!!validationError}
                        aria-describedby="url-error"
                    />
                    <button 
                        onClick={handleAddUrl} 
                        disabled={isLoading || isValidating || !currentUrl.trim()} 
                        className="w-24 shrink-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50 flex items-center justify-center transition-colors"
                    >
                        {isValidating ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Add'
                        )}
                    </button>
                </div>
                {validationError && (
                    <p id="url-error" className="text-red-400 text-sm mt-2 px-1">{validationError}</p>
                )}
            </div>
            <div className="flex-grow space-y-2 overflow-y-auto max-h-80 p-1">
                {urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-md">
                        <span className="text-slate-400 text-sm truncate pr-2">{url}</span>
                        <button onClick={() => handleRemoveUrl(index)} disabled={isLoading} className="text-red-500 hover:text-red-400 text-lg">&times;</button>
                    </div>
                ))}
                {urls.length === 0 && !validationError && (
                    <p className="text-center text-slate-500 pt-8">Add URLs to analyze.</p>
                )}
            </div>
        </div>
    );
};


export const ContentInput: React.FC<ContentInputProps> = (props) => {
  const { 
    inputType, setInputType, inputText, setInputText, urls, setUrls, imageData, setImageData,
    wordCount, setWordCount, onAnalyze, isLoading, isAnalyzeDisabled 
  } = props;

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700/50">
      <div className="flex border-b border-slate-700/50 px-4">
        <TabButton active={inputType === 'text'} onClick={() => setInputType('text')}><DocumentTextIcon className="w-5 h-5"/>Text</TabButton>
        <TabButton active={inputType === 'image'} onClick={() => setInputType('image')}><PhotoIcon className="w-5 h-5"/>Image</TabButton>
        <TabButton active={inputType === 'url'} onClick={() => setInputType('url')}><LinkIcon className="w-5 h-5"/>URL</TabButton>
      </div>

      <div className="flex-grow p-4 md:p-6 flex flex-col min-h-[400px] md:min-h-[50vh]">
        {inputType === 'text' && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your article, transcript, or notes here..."
            className="flex-grow w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none"
            disabled={isLoading}
          />
        )}
        {inputType === 'image' && <ImageUploader imageData={imageData} setImageData={setImageData} isLoading={isLoading}/>}
        {inputType === 'url' && <UrlInput urls={urls} setUrls={setUrls} isLoading={isLoading} />}
      </div>

      <div className="p-4 md:p-6 border-t border-slate-700/50 space-y-4">
        <div>
            <label htmlFor="word-count" className="block text-sm font-medium text-slate-400 mb-2">
                Target Word Count for Summary
            </label>
            <input
                type="number"
                id="word-count"
                value={wordCount}
                onChange={(e) => setWordCount(Math.max(50, Math.min(1000, Number(e.target.value))))}
                min="50"
                max="1000"
                step="10"
                className="w-32 bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={isLoading}
            />
        </div>

        <button
            onClick={onAnalyze}
            disabled={isAnalyzeDisabled}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-200"
        >
            {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
            </>
            ) : (
            <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Analyze Content
            </>
            )}
        </button>
      </div>
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { InputType, ImageData } from '../App';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ContentInputProps {
  inputType: InputType;
  setInputType: (type: InputType) => void;
  inputText: string;
  setInputText: (text: string) => void;
  url: string;
  setUrl: (url: string) => void;
  imageData: ImageData | null;
  setImageData: (data: ImageData | null) => void;
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

const ImageUploader: React.FC<{ imageData: ImageData | null; setImageData: (data: ImageData | null) => void; isLoading: boolean; }> = ({ imageData, setImageData, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result?.toString().split(',')[1];
                if (base64) {
                    setImageData({ base64, mimeType: file.type, name: file.name });
                }
            };
            reader.readAsDataURL(file);
        }
    }, [setImageData]);
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    if (imageData) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <img src={`data:${imageData.mimeType};base64,${imageData.base64}`} alt="preview" className="max-h-64 rounded-lg shadow-lg mb-4" />
                <p className="text-slate-400 mb-2 truncate max-w-full px-4">{imageData.name}</p>
                <button
                    onClick={() => setImageData(null)}
                    disabled={isLoading}
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                    Remove Image
                </button>
            </div>
        );
    }

    return (
        <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 transition-colors duration-200 ${isDragging ? 'border-cyan-500 bg-slate-800' : 'border-slate-700'}`}
        >
            <PhotoIcon className="w-12 h-12 text-slate-500 mb-2" />
            <p className="text-slate-400 mb-2">Drag & drop an image here</p>
            <p className="text-slate-500 text-sm mb-4">or</p>
            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors duration-200">
                <span>Select a file</span>
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={isLoading} />
            </label>
        </div>
    );
};

export const ContentInput: React.FC<ContentInputProps> = (props) => {
  const { 
    inputType, setInputType, inputText, setInputText, url, setUrl, imageData, setImageData,
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
        {inputType === 'url' && (
            <div className="flex-grow flex items-center">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                    disabled={isLoading}
                />
            </div>
        )}
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
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
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


import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ContentInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const ContentInput: React.FC<ContentInputProps> = ({ inputText, setInputText, onAnalyze, isLoading }) => {
  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg p-4 md:p-6 shadow-lg border border-slate-700/50">
      <label htmlFor="content-input" className="text-lg font-semibold mb-3 text-slate-300">
        Your Content
      </label>
      <textarea
        id="content-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your article, transcript, or notes here..."
        className="flex-grow w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none min-h-[400px] md:min-h-[60vh]"
        disabled={isLoading}
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading || !inputText.trim()}
        className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-200"
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
  );
};

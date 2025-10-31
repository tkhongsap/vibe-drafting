import React, { useState, useCallback, useEffect } from 'react';
import type { GeneratedContent } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { EyeIcon } from './icons/EyeIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface ContentOutputProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  error: string | null;
}

const OutputSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-600">Analysis Results</h3>
        <p className="mt-1 text-sm">Your generated content will appear here.</p>
    </div>
);

const SocialHeader: React.FC<{ platformIcon: React.ReactNode; userName: string; userHandle?: string; }> = ({ platformIcon, userName, userHandle }) => (
    <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-grow">
            <p className="font-semibold text-slate-900">{userName}</p>
            {userHandle && <p className="text-sm text-gray-500">{userHandle}</p>}
        </div>
        <div className="text-gray-500">{platformIcon}</div>
    </div>
);

const SocialFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center justify-around mt-3 pt-2 border-t border-gray-100 text-gray-500">
        {children}
    </div>
);

const SocialActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors p-1 rounded-md">
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const LinkedInPreview: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div>
            <h4 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><LinkedInIcon className="w-5 h-5 text-[#0A66C2]" /> LinkedIn Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <SocialHeader platformIcon={<div className="text-xs text-gray-400">...</div>} userName="Your Name" userHandle="You • 1st" />
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">{text}</p>
                <SocialFooter>
                    <SocialActionButton icon={<HeartIcon className="w-5 h-5" />} label="Like" />
                    <SocialActionButton icon={<ChatBubbleIcon className="w-5 h-5" />} label="Comment" />
                    <SocialActionButton icon={<ArrowPathIcon className="w-5 h-5" />} label="Repost" />
                    <SocialActionButton icon={<PaperAirplaneIcon className="w-5 h-5" />} label="Send" />
                </SocialFooter>
            </div>
        </div>
    );
};

const XPreview: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div>
             <h4 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><TwitterIcon className="w-4 h-4" /> X Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <SocialHeader platformIcon={<div className="text-xs text-gray-400">...</div>} userName="Your Name" userHandle="@yourhandle" />
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px]">{text}</p>
                <SocialFooter>
                    <SocialActionButton icon={<ChatBubbleIcon className="w-5 h-5" />} label="12" />
                    <SocialActionButton icon={<ArrowPathIcon className="w-5 h-5" />} label="58" />
                    <SocialActionButton icon={<HeartIcon className="w-5 h-5" />} label="256" />
                    <SocialActionButton icon={<ChartBarIcon className="w-5 h-5" />} label="12.3K" />
                </SocialFooter>
            </div>
        </div>
    );
};

export const ContentOutput: React.FC<ContentOutputProps> = ({ content, isLoading, error }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'linkedin' | 'x'>('idle');
  const [view, setView] = useState<'output' | 'preview'>('output');

  useEffect(() => {
      if (isLoading || !content) {
          setView('output');
      }
  }, [isLoading, content]);
  
  const formatForLinkedIn = useCallback((): string => {
    if (!content) return '';

    const insightsText = content.keyInsights.map(insight => `🔹 ${insight}`).join('\n');
    const factsText = content.interestingFacts.map(fact => `💡 ${fact}`).join('\n');
    
    return `
${content.summary}

---

**Key Insights:**
${insightsText}

**Interesting Facts:**
${factsText}

#ContentCreation #Insights #KnowledgeSharing
    `.trim();
  }, [content]);

  const formatForX = useCallback((): string => {
    if (!content) return '';

    const summaryPart = content.summary;
    const insightsPart = content.keyInsights.map(insight => `• ${insight}`).join('\n');
    
    return `
${summaryPart}

Key Insights:
${insightsPart}

#ContentCreation #AI #Insights
    `.trim();
  }, [content]);

  const handleShareOnLinkedIn = useCallback(() => {
    const linkedInText = formatForLinkedIn();
    navigator.clipboard.writeText(linkedInText).then(() => {
        setCopyStatus('linkedin');
        setTimeout(() => setCopyStatus('idle'), 3000);
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, [formatForLinkedIn]);

  const handleShareOnX = useCallback(() => {
    const xText = formatForX();
    navigator.clipboard.writeText(xText).then(() => {
      setCopyStatus('x');
      setTimeout(() => setCopyStatus('idle'), 3000);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    }).catch(err => {
        console.error('Failed to copy text to clipboard: ', err);
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    });
  }, [formatForX]);
  
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 md:p-8 min-h-[350px] sm:min-h-[400px]">
      {content && (
         <div className="flex justify-end items-center mb-4">
             <button
                 onClick={() => setView(view === 'output' ? 'preview' : 'output')}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                 aria-label={view === 'output' ? 'Switch to preview view' : 'Switch to text view'}
             >
                 {view === 'output' ? (
                    <>
                        <EyeIcon className="w-5 h-5" />
                        <span>Preview</span>
                    </>
                 ) : (
                    <>
                        <DocumentDuplicateIcon className="w-5 h-5" />
                        <span>Text View</span>
                    </>
                 )}
             </button>
         </div>
      )}

      <div className="flex-grow">
        {isLoading && <OutputSkeleton />}
        {error && <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>}
        {!isLoading && !error && !content && <Placeholder />}
        
        {content && view === 'output' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-900">Summary</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{content.summary}</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-900">Key Insights</h3>
              <ul className="space-y-2 list-inside">
                {content.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">&#8226;</span>
                    <span className="text-slate-600 leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-slate-900">Interesting Facts</h3>
              <ul className="space-y-2 list-inside">
                {content.interestingFacts.map((fact, index) => (
                   <li key={index} className="flex items-start">
                    <span className="text-amber-500 mr-3 mt-1">&#8226;</span>
                    <span className="text-slate-600 leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {content && view === 'preview' && (
             <div className="space-y-6 animate-fade-in">
                <LinkedInPreview text={formatForLinkedIn()} />
                <XPreview text={formatForX()} />
            </div>
        )}
      </div>

      {content && (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleShareOnLinkedIn}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white transition-all duration-200"
                >
                    {copyStatus === 'linkedin' ? (
                    <>
                        <ClipboardIcon className="w-5 h-5 mr-2" />
                        Copied for LinkedIn!
                    </>
                    ) : (
                    <>
                        <LinkedInIcon className="w-5 h-5 mr-2" />
                        Copy & Share on LinkedIn
                    </>
                    )}
                </button>
                <button
                    onClick={handleShareOnX}
                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white transition-all duration-200"
                >
                    {copyStatus === 'x' ? (
                    <>
                        <ClipboardIcon className="w-5 h-5 mr-2" />
                        Copied for X!
                    </>
                    ) : (
                    <>
                        <TwitterIcon className="w-5 h-5 mr-2" />
                        Copy & Share on X
                    </>
                    )}
                </button>
            </div>
          {copyStatus !== 'idle' && (
            <p className="text-center text-sm text-blue-600 mt-4 animate-pulse">
                Content copied. Just paste it into the new {copyStatus === 'linkedin' ? 'LinkedIn' : 'X'} tab.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
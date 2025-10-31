import React, { useState, useCallback } from 'react';
import type { GeneratedContent } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { TwitterIcon } from './icons/TwitterIcon';

interface ContentOutputProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  error: string | null;
}

const OutputSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-6 bg-slate-700 rounded w-1/3"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-700 rounded w-1/4"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-4/6"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-slate-700 rounded w-1/3"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-2/3"></div>
    </div>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="text-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-400">Analysis Results</h3>
        <p className="mt-1 text-sm">Your generated content will appear here.</p>
    </div>
);


export const ContentOutput: React.FC<ContentOutputProps> = ({ content, isLoading, error }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'linkedin' | 'twitter'>('idle');
  
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

  const formatForTwitter = useCallback((): string => {
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

  const handleShareOnTwitter = useCallback(() => {
    const twitterText = formatForTwitter();
    navigator.clipboard.writeText(twitterText).then(() => {
      setCopyStatus('twitter');
      setTimeout(() => setCopyStatus('idle'), 3000);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    }).catch(err => {
        console.error('Failed to copy text to clipboard: ', err);
        // Fallback for clipboard failure: just open the window with pre-filled text
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    });
  }, [formatForTwitter]);
  
  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg p-4 md:p-6 shadow-lg border border-slate-700/50 min-h-[400px] md:min-h-[calc(50vh+150px)]">
      <div className="flex-grow">
        {isLoading && <OutputSkeleton />}
        {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
        {!isLoading && !error && !content && <Placeholder />}
        {content && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Summary</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{content.summary}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Key Insights</h3>
              <ul className="space-y-2 list-inside">
                {content.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-cyan-400 mr-2">🔹</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-400">Interesting Facts</h3>
              <ul className="space-y-2 list-inside">
                {content.interestingFacts.map((fact, index) => (
                   <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-2">💡</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {content && (
        <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleShareOnLinkedIn}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-200"
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
                    onClick={handleShareOnTwitter}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-all duration-200"
                >
                    {copyStatus === 'twitter' ? (
                    <>
                        <ClipboardIcon className="w-5 h-5 mr-2" />
                        Copied for Twitter!
                    </>
                    ) : (
                    <>
                        <TwitterIcon className="w-5 h-5 mr-2" />
                        Copy & Share on Twitter
                    </>
                    )}
                </button>
            </div>
          {copyStatus !== 'idle' && (
            <p className="text-center text-sm text-cyan-300 mt-3 animate-pulse">
                Content copied. Just paste it into the new {copyStatus === 'linkedin' ? 'LinkedIn' : 'Twitter'} tab.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import type { GeneratedContent } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { contentHistoryService } from '../services/contentHistoryService';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';

interface ContentOutputProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  error: string | null;
}

const OutputSkeleton: React.FC = () => (
  <div className="p-4 border-b border-slate-700 animate-pulse">
      <div className="flex gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-full flex-shrink-0"></div>
          <div className="flex-grow space-y-4">
              <div className="flex items-center gap-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/5"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
          </div>
      </div>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="text-center text-slate-500 pt-16 px-4">
        <SparklesIcon className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-xl font-bold text-slate-300">Welcome to your Content Studio</h3>
        <p className="mt-2">Use the composer above to analyze text, images, or URLs. Your generated insights will appear here in your feed.</p>
    </div>
);


export const ContentOutput: React.FC<ContentOutputProps> = ({ content, isLoading, error }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'linkedin' | 'x' | 'facebook' | 'instagram'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const formatForLinkedIn = useCallback((): string => {
    if (!content) return '';
    const insightsText = content.keyInsights.map(insight => `🔹 ${insight}`).join('\n');
    const factsText = content.interestingFacts.map(fact => `💡 ${fact}`).join('\n');
    return `${content.summary}\n\n---\n\n**Key Insights:**\n${insightsText}\n\n**Interesting Facts:**\n${factsText}\n\n#ContentCreation #Insights #KnowledgeSharing`.trim();
  }, [content]);

  const formatForX = useCallback((): string => {
    if (!content) return '';
    const summaryPart = content.summary;
    const insightsPart = content.keyInsights.map(insight => `• ${insight}`).join('\n');
    return `${summaryPart}\n\nKey Insights:\n${insightsPart}\n\n#ContentCreation #AI #Insights`.trim();
  }, [content]);

  const formatForFacebook = useCallback((): string => {
    if (!content) return '';
    const insightsText = content.keyInsights.map(insight => `✅ ${insight}`).join('\n');
    const factsText = content.interestingFacts.map(fact => `🤯 ${fact}`).join('\n');
    return `${content.summary}\n\n---\n\nHere are the key takeaways:\n${insightsText}\n\nSome surprising facts:\n${factsText}\n\n#FacebookPost #DigitalMarketing #ContentStrategy`;
  }, [content]);

  const formatForInstagram = useCallback((): string => {
    if (!content) return '';
    return `${content.summary}\n.\n.\n.\n#Instagram #ContentCreation #AI #Tech #Business #Marketing #Insights #InstaGood`;
  }, [content]);

   const copyToClipboard = (text: string, platform: 'linkedin' | 'x' | 'facebook' | 'instagram') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(platform);
      setTimeout(() => setCopyStatus('idle'), 3000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };
  
  const handleShareOnLinkedIn = () => {
    const text = formatForLinkedIn();
    copyToClipboard(text, 'linkedin');
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  const handleShareOnX = () => {
    const text = formatForX();
    copyToClipboard(text, 'x');
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareOnFacebook = () => {
    const text = formatForFacebook();
    copyToClipboard(text, 'facebook');
    window.open('https://www.facebook.com/', '_blank', 'noopener,noreferrer');
  };
  
  const handleShareOnInstagram = () => {
    const text = formatForInstagram();
    copyToClipboard(text, 'instagram');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    if (!content) return;
    contentHistoryService.saveContent(content);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  if (isLoading) return <OutputSkeleton />;
  if (error) return (
    <div className="p-4 border-b border-slate-700">
        <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</div>
    </div>
  );
  if (!content) return <Placeholder />;

  return (
    <article className="border-b border-slate-700 animate-fade-in">
        <div className="flex gap-4 p-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex-shrink-0 flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-50">Content AI</span>
                    <span className="text-slate-500 text-sm">@gemini-assistant · now</span>
                </div>

                <div className="mt-2 space-y-6 text-slate-300">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-100">Summary</h3>
                      <p className="whitespace-pre-wrap leading-relaxed">{content.summary}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-100">Key Insights</h3>
                      <ul className="space-y-2">
                        {content.keyInsights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-400 mr-3 mt-1.5">&#8226;</span>
                            <span className="leading-relaxed">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-100">Interesting Facts</h3>
                      <ul className="space-y-2">
                        {content.interestingFacts.map((fact, index) => (
                           <li key={index} className="flex items-start">
                            <span className="text-amber-400 mr-3 mt-1.5">&#8226;</span>
                            <span className="leading-relaxed">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-start gap-8 text-slate-500">
                    <button onClick={handleShareOnLinkedIn} className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200">
                        <LinkedInIcon className="w-5 h-5" />
                        <span className="text-sm">{copyStatus === 'linkedin' ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button onClick={handleShareOnX} className="flex items-center gap-2 hover:text-slate-300 transition-colors duration-200">
                        <TwitterIcon className="w-5 h-5" />
                        <span className="text-sm">{copyStatus === 'x' ? 'Copied!' : 'Share'}</span>
                    </button>
                     <button onClick={handleShareOnFacebook} className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
                        <FacebookIcon className="w-5 h-5" />
                        <span className="text-sm">{copyStatus === 'facebook' ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button onClick={handleShareOnInstagram} className="flex items-center gap-2 hover:text-pink-500 transition-colors duration-200">
                        <InstagramIcon className="w-5 h-5" />
                        <span className="text-sm">{copyStatus === 'instagram' ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 hover:text-amber-400 transition-colors duration-200">
                        <BookmarkIcon className="w-5 h-5" />
                        <span className="text-sm">{saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div>
    </article>
  );
};
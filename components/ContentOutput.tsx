import React, { useState, useCallback } from 'react';
import type { GeneratedContent } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { contentHistoryService } from '../services/contentHistoryService';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { ThreadsIcon } from './icons/ThreadsIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';


interface ContentOutputProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  error: string | null;
}

const OutputSkeleton: React.FC = () => (
    <div className="p-4 border-b border-slate-700 animate-pulse">
        <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex-shrink-0"></div>
            <div className="flex-grow space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/5"></div>
                </div>
                {/* Summary */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
                {/* Key Insights */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
                {/* Hashtags */}
                <div className="space-y-2">
                   <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                   <div className="flex gap-2 pt-1">
                      <div className="h-6 bg-slate-700 rounded-full w-20"></div>
                      <div className="h-6 bg-slate-700 rounded-full w-24"></div>
                      <div className="h-6 bg-slate-700 rounded-full w-16"></div>
                  </div>
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

const IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; 'aria-label': string; className?: string }> = ({ children, onClick, ...props }) => (
    <button onClick={onClick} className={`p-2 rounded-full hover:bg-blue-500/10 text-slate-500 hover:text-blue-500 transition-colors duration-200`} {...props}>
        {children}
    </button>
);

export const ContentOutput: React.FC<ContentOutputProps> = ({ content, isLoading, error }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const formatForLinkedIn = useCallback((): string => {
    if (!content) return '';
    const insightsText = content.keyInsights.map(insight => `🔹 ${insight}`).join('\n');
    const factsText = content.interestingFacts.map(fact => `💡 ${fact}`).join('\n');
    const hashtagsText = content.hashtags.join(' ');
    return `${content.summary}\n\n---\n\n**Key Insights:**\n${insightsText}\n\n**Interesting Facts:**\n${factsText}\n\n${hashtagsText}`.trim();
  }, [content]);

  const formatForX = useCallback((): string => {
    if (!content) return '';
    const summaryPart = content.summary;
    const insightsPart = content.keyInsights.map(insight => `• ${insight}`).join('\n');
    const hashtagsText = content.hashtags.join(' ');
    return `${summaryPart}\n\nKey Insights:\n${insightsPart}\n\n${hashtagsText}`.trim();
  }, [content]);

  const formatForThreads = useCallback((): string => {
    if (!content) return '';
    const summaryPart = content.summary;
    const insightsPart = content.keyInsights.map(insight => `• ${insight}`).join('\n');
    const hashtagsText = content.hashtags.join(' ');
    return `${summaryPart}\n\nKey Insights:\n${insightsPart}\n\n${hashtagsText}`.trim();
  }, [content]);
  
  const formatForFacebook = useCallback((): string => {
    if (!content) return '';
    const insightsText = content.keyInsights.map(insight => `🔹 ${insight}`).join('\n');
    const factsText = content.interestingFacts.map(fact => `💡 ${fact}`).join('\n');
    const hashtagsText = content.hashtags.join(' ');
    return `${content.summary}\n\n---\n\nKey Insights:\n${insightsText}\n\nInteresting Facts:\n${factsText}\n\n${hashtagsText}`.trim();
  }, [content]);

  const formatForInstagram = useCallback((): string => {
    if (!content) return '';
    const hashtagsText = content.hashtags.join(' ');
    return `${content.summary}\n.\n.\n.\n${hashtagsText}`.trim();
  }, [content]);

  const handleSave = useCallback(() => {
    if (!content) return;
    contentHistoryService.saveContent(content);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  }, [content]);

  const handleCopyToClipboard = useCallback(() => {
    if (!content) return;
    const textToCopy = formatForLinkedIn(); // A good generic professional format
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [content, formatForLinkedIn]);

  const handleShare = useCallback((platform: 'linkedin' | 'x' | 'threads' | 'facebook' | 'instagram') => {
    if (!content) return;
    let text: string;
    let url: string | undefined;

    switch (platform) {
      case 'x':
        text = formatForX();
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        text = formatForLinkedIn();
        navigator.clipboard.writeText(text).then(() => {
          alert('LinkedIn post content copied to clipboard. Paste it in the new tab to create your post.');
          window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
        });
        return;
      case 'threads':
        text = formatForThreads();
        url = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        text = formatForFacebook();
        url = `https://www.facebook.com/sharer/sharer.php?u=https://ai.google.dev/&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        text = formatForInstagram();
        navigator.clipboard.writeText(text).then(() => {
          alert('Instagram caption copied to clipboard. You can now paste it in the Instagram app.');
        });
        return;
      default:
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [content, formatForX, formatForLinkedIn, formatForThreads, formatForFacebook, formatForInstagram]);

  if (isLoading) {
    return <OutputSkeleton />;
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <h3 className="font-bold text-lg">An Error Occurred</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }
  if (!content) {
    return <Placeholder />;
  }

  return (
    <article className="p-4 border-b border-slate-700 animate-fade-in">
        <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex-shrink-0 flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-grow">
                <div>
                    <span className="font-bold text-slate-50">Content AI Post</span>
                    <span className="text-slate-500 text-sm"> · Just now</span>
                </div>

                <div className="mt-2 text-slate-300 space-y-4">
                    <p className="whitespace-pre-wrap leading-relaxed">{content.summary}</p>
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-slate-100">Key Insights</h3>
                        <ul className="space-y-1 list-disc list-inside">
                            {content.keyInsights.map((insight, index) => (
                                <li key={index} className="text-sm">{insight}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-slate-100">Interesting Facts</h3>
                        <ul className="space-y-1 list-disc list-inside">
                            {content.interestingFacts.map((fact, index) => (
                                <li key={index} className="text-sm">{fact}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="flex items-center gap-2 text-md font-semibold mb-2 text-slate-100">
                           <HashtagIcon className="w-5 h-5" />
                           <span>Hashtags</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {content.hashtags.map((tag, index) => (
                                <span key={index} className="bg-blue-500/10 text-blue-400 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 mt-6 -ml-2">
                    <div className="flex items-center gap-1">
                        <IconButton onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
                            <LinkedInIcon className="w-5 h-5" />
                        </IconButton>
                        <IconButton onClick={() => handleShare('x')} aria-label="Share on X">
                            <TwitterIcon className="w-5 h-5" />
                        </IconButton>
                         <IconButton onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                            <FacebookIcon className="w-5 h-5" />
                        </IconButton>
                        <IconButton onClick={() => handleShare('threads')} aria-label="Share on Threads">
                            <ThreadsIcon className="w-5 h-5" />
                        </IconButton>
                        <IconButton onClick={() => handleShare('instagram')} aria-label="Share on Instagram">
                            <InstagramIcon className="w-5 h-5" />
                        </IconButton>
                    </div>

                    <div className="flex items-center gap-1">
                        <IconButton onClick={handleSave} aria-label="Save post">
                           {saveStatus === 'saved' 
                                ? <BookmarkIcon className="w-5 h-5 text-green-500" fill="currentColor" /> 
                                : <BookmarkIcon className="w-5 h-5" />}
                        </IconButton>
                        <IconButton onClick={handleCopyToClipboard} aria-label="Copy post text">
                           {copyStatus === 'copied' 
                                ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                : <ClipboardIcon className="w-5 h-5" />}
                        </IconButton>
                    </div>
                </div>
            </div>
        </div>
    </article>
  );
};

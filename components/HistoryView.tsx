import React, { useState, useEffect, useCallback } from 'react';
import { contentHistoryService } from '../services/contentHistoryService';
import type { SavedContent } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

const SavedContentItem: React.FC<{ item: SavedContent; onDelete: (id: string) => void; }> = ({ item, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Heuristic to check if text might be clamped
    const isClamped = !isExpanded && item.summary.length > 200;

    return (
        <article className="border-b border-slate-700 animate-fade-in p-4">
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <SparklesIcon className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-bold text-slate-50">Saved Content AI Post</span>
                            <span className="text-slate-500 text-sm"> · {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                            onClick={() => onDelete(item.id)}
                            className="text-slate-500 hover:text-red-500 transition-colors text-xl font-bold"
                            aria-label="Delete saved item"
                        >
                            &times;
                        </button>
                    </div>
                    
                    <div className="mt-2 text-slate-300">
                        <p className={`whitespace-pre-wrap leading-relaxed ${isClamped ? 'line-clamp-3' : ''}`}>{item.summary}</p>
                        {isClamped && (
                            <button onClick={() => setIsExpanded(true)} className="text-blue-500 hover:underline mt-2 text-sm">
                                Show more
                            </button>
                        )}
                    </div>
                    
                    {isExpanded && (
                        <div className="mt-4 space-y-4 animate-fade-in">
                            <div>
                                <h3 className="text-md font-semibold mb-2 text-slate-100">Key Insights</h3>
                                <ul className="space-y-1">
                                    {item.keyInsights.map((insight, index) => (
                                        <li key={index} className="flex items-start text-sm">
                                            <span className="text-blue-400 mr-2 mt-1">&#8226;</span>
                                            <span>{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold mb-2 text-slate-100">Interesting Facts</h3>
                                <ul className="space-y-1">
                                    {item.interestingFacts.map((fact, index) => (
                                        <li key={index} className="flex items-start text-sm">
                                            <span className="text-amber-400 mr-2 mt-1">&#8226;</span>
                                            <span>{fact}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => setIsExpanded(false)} className="text-blue-500 hover:underline mt-2 text-sm">
                                Show less
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};


export const HistoryView: React.FC = () => {
    const [history, setHistory] = useState<SavedContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = useCallback(() => {
        const savedContent = contentHistoryService.getHistory();
        setHistory(savedContent);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleDelete = (id: string) => {
        contentHistoryService.deleteContent(id);
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    if (isLoading) {
        return <div className="p-4 text-center text-slate-500">Loading history...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center text-slate-500 pt-16 px-4">
                <h3 className="mt-4 text-xl font-bold text-slate-300">No Saved Posts Yet</h3>
                <p className="mt-2">When you generate content you like, click the "Save" button to keep it here for later.</p>
            </div>
        );
    }
    
    return (
        <div>
            {history.map(item => (
                <SavedContentItem key={item.id} item={item} onDelete={handleDelete} />
            ))}
        </div>
    );
};

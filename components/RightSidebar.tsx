import React, { useState, useEffect } from 'react';
import { getTrendingTopics } from '../services/geminiService';
import type { TrendTopic } from '../types';

const Trend: React.FC<{ category: string; title: string; posts: string }> = ({ category, title, posts }) => (
    <div className="px-4 py-3 hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer">
        <p className="text-sm text-slate-500">{category}</p>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-slate-500">{posts}</p>
    </div>
);

const TrendSkeleton: React.FC = () => (
    <div className="px-4 py-3 animate-pulse">
        <div className="h-3 bg-slate-700 rounded w-2/4 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-1/3"></div>
    </div>
);

export const RightSidebar: React.FC = () => {
    const [trends, setTrends] = useState<TrendTopic[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fetchedTrends = await getTrendingTopics();
                setTrends(fetchedTrends);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                setError(errorMessage);
                // Set fallback trends on error to maintain UI structure
                setTrends([
                    { category: "AI · Trending", title: "Gemini 2.5", posts: "125K posts" },
                    { category: "Tech · Trending", title: "#React19", posts: "50.2K posts" },
                    { category: "Business · Trending", title: "Content Marketing", posts: "22.1K posts" }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrends();
    }, []);


    return (
        <aside className="w-[350px] ml-8 hidden lg:block">
            <div className="sticky top-0 py-4">
                <div className="bg-slate-800 rounded-2xl">
                    <h2 className="text-xl font-bold px-4 py-3">What's happening</h2>
                    {isLoading ? (
                        <>
                            <TrendSkeleton />
                            <TrendSkeleton />
                            <TrendSkeleton />
                        </>
                    ) : (
                        trends.map((trend, index) => (
                            <Trend key={index} {...trend} />
                        ))
                    )}
                    <div className="px-4 py-3 hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer">
                        <p className="text-blue-500">Show more</p>
                    </div>
                </div>
                <footer className="mt-4 px-4 text-sm text-slate-500 space-x-3">
                     <a href="#" className="hover:underline">Terms of Service</a>
                     <a href="#" className="hover:underline">Privacy Policy</a>
                     <a href="#" className="hover:underline">Cookie Policy</a>
                </footer>
            </div>
        </aside>
    );
};

import React from 'react';

const Trend: React.FC<{ category: string; title: string; posts: string }> = ({ category, title, posts }) => (
    <div className="px-4 py-3 hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer">
        <p className="text-sm text-slate-500">{category}</p>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-slate-500">{posts}</p>
    </div>
);

export const RightSidebar: React.FC = () => {
    return (
        <aside className="w-[350px] ml-8 hidden lg:block">
            <div className="sticky top-0 py-4 space-y-6">
                <div className="bg-slate-800 rounded-2xl">
                    <h2 className="text-xl font-bold p-4">What's happening</h2>
                    <Trend category="AI · Trending" title="Gemini 2.5" posts="125K posts" />
                    <Trend category="Tech · Trending" title="#React19" posts="50.2K posts" />
                    <Trend category="Business · Trending" title="Content Marketing" posts="22.1K posts" />
                    <div className="px-4 py-3 text-blue-500 hover:bg-slate-800/60 rounded-b-2xl transition-colors duration-200 cursor-pointer">
                        Show more
                    </div>
                </div>
            </div>
        </aside>
    );
};
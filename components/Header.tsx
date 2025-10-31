
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-slate-700/50">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Content Insight Generator
        </h1>
        <p className="text-slate-400 mt-1">
          Transform your drafts into share-worthy LinkedIn posts.
        </p>
      </div>
    </header>
  );
};

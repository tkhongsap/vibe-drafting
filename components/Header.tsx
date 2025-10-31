import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-gray-200">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900">
          Content Insight Generator
        </h1>
        <p className="text-slate-600 mt-2">
          Your AI sidekick for crafting viral content.
        </p>
      </div>
    </header>
  );
};
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleIcon } from './icons/GoogleIcon';

export const LandingPage: React.FC = () => {
  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl animate-fade-in">
        <SparklesIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-50">
          Welcome to Content Studio
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-400">
          Your AI-powered assistant to summarize, analyze, and generate engaging social media posts from any content.
        </p>
        <p className="mt-2 text-md text-slate-500">
          Sign in with Google, GitHub, Twitter, Apple, or email to get started
        </p>
        <div className="mt-10">
          <button
            onClick={handleSignIn}
            className="inline-flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 hover:bg-slate-100"
          >
            <GoogleIcon className="w-6 h-6" />
            <span>Sign in</span>
          </button>
        </div>
      </div>
       <footer className="absolute bottom-8 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Content Studio. All rights reserved.
      </footer>
    </div>
  );
};
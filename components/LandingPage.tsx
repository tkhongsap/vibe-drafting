import React, { useState } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await authService.signIn();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Sign in failed", error);
      // In a real app, you might want to show an error message to the user
      setIsLoading(false);
    }
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
        <div className="mt-10">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 disabled:opacity-70"
          >
            <GoogleIcon className="w-6 h-6" />
            <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
       <footer className="absolute bottom-8 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Content Studio. All rights reserved.
      </footer>
    </div>
  );
};
import React, { useState } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { GoogleIcon } from './icons/GoogleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const user = await authService.signInWithGoogle();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Sign in failed", error);
      setIsSigningIn(false);
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
            disabled={isSigningIn}
            className="flex items-center justify-center gap-3 w-full sm:w-auto mx-auto bg-white text-slate-800 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
          >
            <GoogleIcon />
            <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
       <footer className="absolute bottom-8 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Content Studio. All rights reserved.
      </footer>
    </div>
  );
};

import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Glass Card Container */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-10 max-w-md w-full text-center">
        {/* Logo with Glow */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.3)] animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 font-['Space_Grotesk']">
          Welcome to Signal
        </h1>

        {/* Tagline */}
        <p className="text-lg text-zinc-400 text-center mb-10">
          Amplify your professional signal through AI-powered social content creation
        </p>

        {/* Get Started Button with Neumorphic + Glass Effect */}
        <button
          onClick={onGetStarted}
          className="w-full px-8 py-4 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl shadow-[0_0_40px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(20,184,166,0.4),4px_4px_12px_rgba(0,0,0,0.5),-4px_-4px_12px_rgba(255,255,255,0.08)] transition-all duration-300 transform hover:scale-[1.02]"
        >
          Get Started
        </button>

        {/* Already have account */}
        <p className="mt-6 text-zinc-500">
          Already have an account?{' '}
          <button className="text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default WelcomeScreen;

import React, { useState, useEffect } from 'react';
import { BTN_BASE } from '../../styles';

interface TourStep {
  title: string;
  content: string;
  targetId?: string; // ID of the element to spotlight
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Nano Banana Pro',
    content: 'The world\'s most advanced LinkedIn banner creator. Let\'s get you a professional banner in 60 seconds.',
    icon: 'celebration'
  },
  {
    title: 'AI Generation',
    content: 'Type what you vision here. Use "Prompt Enhance" to let AI add professional details automatically.',
    targetId: 'gen-sidebar',
    icon: 'auto_fix_high'
  },
  {
    title: 'Template Library',
    content: 'Not sure where to start? Pick a curated industry-specific template to get a head start.',
    targetId: 'subnav-templates',
    icon: 'auto_awesome_motion'
  },
  {
    title: 'Talk to Benno',
    content: 'Need help? Click the mic to talk to Benno. You can say "Make it more blue" or "Add a tech tagline".',
    targetId: 'voice-toggle',
    icon: 'mic'
  },
  {
    title: 'Export & Launch',
    content: 'Once you\'re ready, export your design in high resolution. Perfectly sized for LinkedIn.',
    targetId: 'export-panel',
    icon: 'download'
  }
];

export const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('nanobanna-tour-completed');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Delay for better feel
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('nanobanna-tour-completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-zinc-900 border border-purple-500/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(168,85,247,0.2)] relative animate-fadeIn'>
        <button 
          onClick={handleComplete}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
        >
          <span className='material-icons'>close</span>
        </button>

        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/20'>
            <span className='material-icons text-3xl text-white'>{step.icon}</span>
          </div>
          <h2 className='text-2xl font-black text-white uppercase tracking-wider mb-2'>{step.title}</h2>
          <p className='text-sm text-zinc-400 leading-relaxed'>{step.content}</p>
        </div>

        <div className='flex items-center justify-between gap-4 mt-8'>
          <div className='flex gap-1'>
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-purple-500' : 'w-1.5 bg-zinc-800'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className={`${BTN_BASE} px-8 bg-white text-black hover:bg-zinc-200`}
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

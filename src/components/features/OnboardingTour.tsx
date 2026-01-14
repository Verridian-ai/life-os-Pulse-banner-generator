import React, { useState, useEffect } from 'react';
import { BTN_BASE } from '../../styles';
import { onboardingStorage } from '../../services/storageManager';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface TourStep {
  title: string;
  content: string;
  targetId?: string; // ID of the element to spotlight
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Nano Banana Pro',
    content:
      "The world's most advanced LinkedIn banner creator. Let's get you a professional banner in 60 seconds.",
    icon: 'celebration',
  },
  {
    title: 'AI Generation',
    content:
      'Type what you vision here. Use "Prompt Enhance" to let AI add professional details automatically.',
    targetId: 'gen-sidebar',
    icon: 'auto_fix_high',
  },
  {
    title: 'Template Library',
    content:
      'Not sure where to start? Pick a curated industry-specific template to get a head start.',
    targetId: 'subnav-templates',
    icon: 'auto_awesome_motion',
  },
  {
    title: 'Talk to Benno',
    content:
      'Need help? Click the mic to talk to Benno. You can say "Make it more blue" or "Add a tech tagline".',
    targetId: 'voice-toggle',
    icon: 'mic',
  },
  {
    title: 'Export & Launch',
    content:
      "Once you're ready, export your design in high resolution. Perfectly sized for LinkedIn.",
    targetId: 'export-panel',
    icon: 'download',
  },
];

export const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasCompletedTour = onboardingStorage.get<string>('tour-completed');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Delay for better feel
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    onboardingStorage.set('tour-completed', 'true');
    setIsVisible(false);
  };

  // Focus trap
  const modalRef = useFocusTrap(isVisible, handleComplete);

  // Update target position
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Ensure element is actually visible in viewport
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
            return;
          }
        }
      }
      setTargetRect(null);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // Capture scroll on any element

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleComplete();
          break;
        case 'ArrowRight':
          if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((c) => c + 1);
          } else {
            handleComplete();
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            setCurrentStep((c) => c - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  // Render logic based on whether we have a spotlight target or not
  if (targetRect) {
    // SPOTLIGHT MODE
    // Determine popover position (prefer bottom, flip to top if needed)
    const POPOVER_WIDTH = 400; // max-w-md approx
    const SPACING = 20;

    // Check space below
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const isTopPosition = spaceBelow < 300 && targetRect.top > 300;

    const popoverStyle: React.CSSProperties = {
      position: 'absolute',
      width: '100%',
      maxWidth: '448px', // max-w-md
      left: Math.max(
        16,
        Math.min(
          window.innerWidth - POPOVER_WIDTH - 16,
          targetRect.left + targetRect.width / 2 - POPOVER_WIDTH / 2,
        ),
      ),
      ...(isTopPosition
        ? { bottom: window.innerHeight - targetRect.top + SPACING }
        : { top: targetRect.bottom + SPACING }),
    };

    return (
      <div
        className='fixed inset-0 z-[200] overflow-hidden'
        role='dialog'
        aria-modal='true'
        aria-labelledby='tour-title'
      >
        {/* Spotlight Overlay - The "Hole" */}
        <div
          className='absolute transition-all duration-300 ease-out'
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            borderRadius: '12px', // Slight radius for UI elements
            pointerEvents: 'none', // Allow clicks through to target if desired? No, usually tour blocks.
            // But here the overlay visually blocks rest.
            // We'll put a transparent click blocker over the whole screen if we want to block interactions outside modal.
          }}
        />

        {/* Click trap for outside */}
        <div className='absolute inset-0 z-[-1]' onClick={handleComplete} />

        {/* Popover */}
        <div
          ref={modalRef}
          className='bg-zinc-900 border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-fadeIn flex flex-col relative z-10'
          style={popoverStyle}
        >
          {/* ... Modal Content (Same as before, slightly more compact possibly) ... */}
          <button
            type='button'
            onClick={handleComplete}
            className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
            aria-label='Skip tour'
            title='Skip tour (Esc)'
          >
            <span className='material-icons'>close</span>
          </button>

          <div className='flex gap-4'>
            <div className='flex-shrink-0'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20'>
                <span className='material-icons text-2xl text-white' aria-hidden='true'>
                  {step.icon}
                </span>
              </div>
            </div>
            <div>
              <h2
                id='tour-title'
                className='text-lg font-black text-white uppercase tracking-wider mb-2'
              >
                {step.title}
              </h2>
              <p className='text-sm text-zinc-400 leading-relaxed mb-4'>{step.content}</p>

              <div className='flex items-center justify-between gap-4'>
                <div
                  className='flex gap-1'
                  role='progressbar'
                  aria-valuenow={currentStep + 1}
                  aria-valuemin={1}
                  aria-valuemax={TOUR_STEPS.length}
                  aria-label={`Step ${currentStep + 1} of ${TOUR_STEPS.length}`}
                >
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-purple-500' : 'w-1.5 bg-zinc-800'}`}
                    />
                  ))}
                </div>
                <div className='flex items-center gap-3'>
                  {currentStep > 0 && (
                    <button
                      type='button'
                      onClick={() => setCurrentStep((c) => c - 1)}
                      className='text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider transition'
                      aria-label='Previous step'
                    >
                      Prev
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={handleComplete}
                    className='text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider underline-offset-4 hover:underline transition'
                  >
                    Skip
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      currentStep < TOUR_STEPS.length - 1
                        ? setCurrentStep((c) => c + 1)
                        : handleComplete()
                    }
                    className={`${BTN_BASE} px-6 py-2 bg-white text-black hover:bg-zinc-200 text-xs`}
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT CENTERED MODE (Fallback)
  return (
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='tour-title'
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-purple-500/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(168,85,247,0.2)] relative animate-fadeIn flex flex-col'
      >
        <button
          type='button'
          onClick={handleComplete}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
          aria-label='Skip tour'
          title='Skip tour (Esc)'
        >
          <span className='material-icons'>close</span>
        </button>

        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/20'>
            <span className='material-icons text-3xl text-white' aria-hidden='true'>
              {step.icon}
            </span>
          </div>
          <h2
            id='tour-title'
            className='text-2xl font-black text-white uppercase tracking-wider mb-2'
          >
            {step.title}
          </h2>
          <p className='text-sm text-zinc-400 leading-relaxed'>{step.content}</p>
        </div>

        <div className='flex items-center justify-between gap-4 mt-8'>
          <div
            className='flex gap-1'
            role='progressbar'
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={TOUR_STEPS.length}
            aria-label={`Step ${currentStep + 1} of ${TOUR_STEPS.length}`}
          >
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-purple-500' : 'w-1.5 bg-zinc-800'}`}
              />
            ))}
          </div>

          <div className='flex items-center gap-3'>
            {currentStep > 0 && (
              <button
                type='button'
                onClick={() => setCurrentStep((c) => c - 1)}
                className='text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider transition'
                aria-label='Previous step'
              >
                Prev
              </button>
            )}
            <button
              type='button'
              onClick={handleComplete}
              className='text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider underline-offset-4 hover:underline transition'
            >
              Skip
            </button>
            <button
              type='button'
              onClick={() => {
                if (currentStep < TOUR_STEPS.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleComplete();
                }
              }}
              className={`${BTN_BASE} px-8 bg-white text-black hover:bg-zinc-200`}
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

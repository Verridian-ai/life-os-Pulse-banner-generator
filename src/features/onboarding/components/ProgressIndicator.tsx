/**
 * ProgressIndicator
 *
 * Visual progress indicator for multi-step onboarding flow.
 * Displays step dots with labels and completion state.
 */

import React from 'react';

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
};

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressIndicatorProps): React.ReactElement {
  return (
    <div className='flex items-center justify-between'>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const label = stepLabels[index] || `Step ${index + 1}`;

        return (
          <React.Fragment key={index}>
            <div className='flex flex-col items-center'>
              {/* Step indicator dot */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-cyan-500 text-white'
                      : isCurrent
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                  }
                `}
              >
                {isCompleted ? <span className='material-icons text-lg'>check</span> : index + 1}
              </div>

              {/* Step label */}
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'}
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < totalSteps - 1 && (
              <div className='flex-1 mx-2 h-0.5 relative'>
                <div className='absolute inset-0 bg-zinc-800 rounded-full' />
                <div
                  className={`
                    absolute inset-0 bg-cyan-500 rounded-full transition-all duration-500
                    ${index < currentStep ? 'w-full' : 'w-0'}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

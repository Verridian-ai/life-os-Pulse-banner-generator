// EnhanceButton - Reusable AI prompt enhancement button
import React from 'react';
import { usePromptEnhance } from '@/hooks/usePromptEnhance';
import { PromptEnhanceContext } from '@/services/llm';

interface EnhanceButtonProps {
  prompt: string;
  onEnhanced: (enhancedPrompt: string) => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'ghost';
  context?: PromptEnhanceContext;
  className?: string;
  showLabel?: boolean;
}

/**
 * Reusable button component for enhancing prompts with AI
 * Use this across all prompt inputs for consistent UX
 */
export function EnhanceButton({
  prompt,
  onEnhanced,
  disabled = false,
  size = 'sm',
  variant = 'primary',
  context,
  className = '',
  showLabel = true,
}: EnhanceButtonProps) {
  const { enhance, isEnhancing, error, clearError } = usePromptEnhance();

  const handleClick = async () => {
    clearError();
    const result = await enhance(prompt, context);
    if (result) {
      onEnhanced(result);
    }
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-1 text-[8px] gap-0.5',
    sm: 'px-2 py-1.5 text-[9px] gap-1',
    md: 'px-3 py-2 text-[10px] gap-1.5',
  };

  const iconSizes = {
    xs: 'text-[10px]',
    sm: 'text-[12px]',
    md: 'text-sm',
  };

  // Variant classes
  const variantClasses = {
    primary: prompt.trim()
      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20'
      : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none',
    secondary: prompt.trim()
      ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10'
      : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none',
    ghost: prompt.trim()
      ? 'bg-transparent text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
      : 'bg-transparent text-zinc-600 cursor-not-allowed',
  };

  const isDisabled = disabled || isEnhancing || !prompt.trim();

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      title={error || 'Enhance prompt with AI'}
      className={`
        flex items-center justify-center font-black uppercase tracking-wider rounded-xl transition-all
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isEnhancing ? (
        <>
          <div className={`border-2 border-current/30 border-t-current rounded-full animate-spin ${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
          {showLabel && <span>Enhancing...</span>}
        </>
      ) : (
        <>
          <span className={`material-icons ${iconSizes[size]}`}>auto_fix_high</span>
          {showLabel && <span>Enhance</span>}
        </>
      )}
    </button>
  );
}

export default EnhanceButton;

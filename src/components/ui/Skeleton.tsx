import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'shimmer' | 'pulse';
  width?: string | number;
  height?: string | number;
}

/**
 * Reusable Skeleton component for perceived performance improvements
 * Mimics the shape of loading content
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'shimmer',
  width,
  height
}) => {
  /* 
   * Logic: 
   * - 'shimmer' variant uses the .skeleton class (from index.css) which has its own background gradient and animation.
   * - 'pulse' variant uses standard Tailwind animate-pulse + bg-white/5.
   * - Other variants default to pulse animation if not shimmer.
   */
  const isShimmer = variant === 'shimmer';
  const baseClasses = isShimmer ? 'skeleton' : 'animate-pulse bg-white/5';

  const variantClasses = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded h-3 w-full',
    pulse: 'rounded-xl', // Explicit pulse variant
    shimmer: 'rounded-xl' // Default shape for shimmer is rect-like
  };

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.shimmer} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const ImageCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 h-full flex flex-col">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" />
    </div>
  </div>
);

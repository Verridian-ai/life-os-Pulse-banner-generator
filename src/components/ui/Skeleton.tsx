import React from 'react';

interface SkeletonProps {
  className?: string;
  /** Shape variant - all shapes use shimmer animation by default */
  variant?: 'rect' | 'circle' | 'text';
  /** Animation type - shimmer (default) or pulse */
  animation?: 'shimmer' | 'pulse';
  width?: string | number;
  height?: string | number;
}

/**
 * Reusable Skeleton component for perceived performance improvements
 * Mimics the shape of loading content with premium shimmer animation
 *
 * @example
 * // Basic usage (shimmer rect)
 * <Skeleton height={200} />
 *
 * // Circle shape with shimmer
 * <Skeleton variant="circle" width={40} height={40} />
 *
 * // Text placeholder with shimmer
 * <Skeleton variant="text" width="80%" />
 *
 * // Explicit pulse animation (fallback style)
 * <Skeleton animation="pulse" height={100} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  animation = 'shimmer',
  width,
  height
}) => {
  // Animation classes - shimmer uses CSS class, pulse uses Tailwind
  const animationClasses = animation === 'shimmer'
    ? 'skeleton'
    : 'animate-pulse bg-white/5';

  // Shape classes based on variant
  const shapeClasses = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${animationClasses} ${shapeClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Pre-built skeleton for image cards with thumbnail and metadata
 * Uses shimmer animation for premium loading experience
 */
export const ImageCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 h-full flex flex-col">
    {/* Image thumbnail skeleton */}
    <Skeleton className="aspect-video w-full rounded-none" />
    {/* Metadata skeleton */}
    <div className="p-4 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" />
    </div>
  </div>
);

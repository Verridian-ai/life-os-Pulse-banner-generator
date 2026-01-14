/**
 * useSpring - Luxury lag physics hook for award-winning animations
 *
 * Implements Spring physics from High-End Web Tech Stack Analysis:
 * - Lerp interpolation for smooth transitions
 * - Spring physics (tension, friction, mass)
 * - Good Friction for intentional engagement
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Spring configuration presets from motion.json
export const SPRING_PRESETS = {
  snappy: { tension: 300, friction: 20, mass: 1 },
  smooth: { tension: 170, friction: 26, mass: 1 },
  heavy: { tension: 120, friction: 14, mass: 2 },
  bouncy: { tension: 400, friction: 10, mass: 0.8 },
  gentle: { tension: 100, friction: 30, mass: 1.5 },
} as const;

// Lerp factors from motion.json
export const LERP_FACTORS = {
  scroll: 0.1,
  cursor: 0.06,
  heavyCursor: 0.05,
  lightCursor: 0.08,
  drag: 0.12,
  magnetic: 0.15,
} as const;

// Easing functions from motion.json
export const EASING = {
  luxuryOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  luxuryInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
}

export interface SpringValue {
  current: number;
  velocity: number;
  target: number;
}

/**
 * Linear interpolation (Lerp) for smooth transitions
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Spring physics calculation
 */
function springStep(value: SpringValue, config: SpringConfig, deltaTime: number): SpringValue {
  const { tension, friction, mass } = config;
  const { current, velocity, target } = value;

  // Spring force: F = -k * x (Hooke's Law)
  const springForce = -tension * (current - target);

  // Damping force: F = -c * v
  const dampingForce = -friction * velocity;

  // Acceleration: a = F / m
  const acceleration = (springForce + dampingForce) / mass;

  // Update velocity and position
  const newVelocity = velocity + acceleration * deltaTime;
  const newCurrent = current + newVelocity * deltaTime;

  return {
    current: newCurrent,
    velocity: newVelocity,
    target,
  };
}

/**
 * Check if spring animation is at rest
 */
function isAtRest(value: SpringValue, threshold = 0.001): boolean {
  return Math.abs(value.current - value.target) < threshold && Math.abs(value.velocity) < threshold;
}

/**
 * useSpring hook for single value animation
 */
export function useSpring(
  initialValue: number,
  config: SpringConfig | keyof typeof SPRING_PRESETS = 'smooth',
) {
  const springConfig = typeof config === 'string' ? SPRING_PRESETS[config] : config;

  const [value, setValue] = useState(initialValue);
  const springRef = useRef<SpringValue>({
    current: initialValue,
    velocity: 0,
    target: initialValue,
  });
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const animateRef = useRef<() => void>(() => {});

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0.016;
    lastTimeRef.current = now;

    springRef.current = springStep(springRef.current, springConfig, deltaTime);
    setValue(springRef.current.current);

    if (!isAtRest(springRef.current)) {
      rafRef.current = requestAnimationFrame(animateRef.current);
    } else {
      // Snap to target when at rest
      springRef.current.current = springRef.current.target;
      springRef.current.velocity = 0;
      setValue(springRef.current.target);
    }
  }, [springConfig]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const set = useCallback(
    (newTarget: number) => {
      springRef.current.target = newTarget;
      lastTimeRef.current = null;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    },
    [animate],
  );

  const setImmediate = useCallback((newValue: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    springRef.current = {
      current: newValue,
      velocity: 0,
      target: newValue,
    };
    setValue(newValue);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { value, set, setImmediate };
}

/**
 * useLerp hook for smooth interpolated values (luxury lag)
 */
export function useLerp(
  initialValue: number,
  factor: number | keyof typeof LERP_FACTORS = 'cursor',
) {
  const lerpFactor = typeof factor === 'string' ? LERP_FACTORS[factor] : factor;

  const [value, setValue] = useState(initialValue);
  const targetRef = useRef(initialValue);
  const currentRef = useRef(initialValue);
  const rafRef = useRef<number | null>(null);
  const animateRef = useRef<() => void>(() => {});

  const animate = useCallback(() => {
    currentRef.current = lerp(currentRef.current, targetRef.current, lerpFactor);
    setValue(currentRef.current);

    const diff = Math.abs(currentRef.current - targetRef.current);
    if (diff > 0.001) {
      rafRef.current = requestAnimationFrame(animateRef.current);
    } else {
      currentRef.current = targetRef.current;
      setValue(targetRef.current);
    }
  }, [lerpFactor]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const set = useCallback(
    (newTarget: number) => {
      targetRef.current = newTarget;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    },
    [animate],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { value, set };
}

/**
 * useSpringXY hook for 2D animations (cursor, drag, etc.)
 */
export function useSpringXY(
  initialX: number,
  initialY: number,
  config: SpringConfig | keyof typeof SPRING_PRESETS = 'smooth',
) {
  const x = useSpring(initialX, config);
  const y = useSpring(initialY, config);

  const set = useCallback(
    (newX: number, newY: number) => {
      x.set(newX);
      y.set(newY);
    },
    [x, y],
  );

  const setImmediate = useCallback(
    (newX: number, newY: number) => {
      x.setImmediate(newX);
      y.setImmediate(newY);
    },
    [x, y],
  );

  return {
    x: x.value,
    y: y.value,
    set,
    setImmediate,
  };
}

export default useSpring;

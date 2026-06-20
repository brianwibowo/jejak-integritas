'use client';

import { useState, useEffect } from 'react';

export type DeviceTier = 'desktop' | 'tablet' | 'mobile';

interface DeviceTierResult {
  tier: DeviceTier;
  isPortrait: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getTier(width: number): DeviceTier {
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

function getIsPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  // Use screen.orientation if available, fallback to dimensions
  if (screen.orientation) {
    return screen.orientation.type.startsWith('portrait');
  }
  return window.innerHeight > window.innerWidth;
}

export function useDeviceTier(): DeviceTierResult {
  const [tier, setTier] = useState<DeviceTier>('desktop');
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const update = () => {
      // Use the larger dimension to determine tier (so portrait doesn't misclassify)
      const w = Math.max(window.innerWidth, window.innerHeight);
      setTier(getTier(w));
      setIsPortrait(getIsPortrait());
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', () => {
      // Small delay for orientation change to settle
      setTimeout(update, 150);
    });

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return {
    tier,
    isPortrait,
    isMobile: tier === 'mobile',
    isTablet: tier === 'tablet',
    isDesktop: tier === 'desktop',
  };
}

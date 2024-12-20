import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/seoTracker';

export const SEOOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Initialize tracking and store cleanup function
    const initializeTracking = async () => {
      cleanup = await trackPageView(location.pathname);
    };

    initializeTracking();

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [location.pathname]);

  return null;
};
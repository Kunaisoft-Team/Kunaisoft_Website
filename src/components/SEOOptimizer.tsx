import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/seoTracker';

export const SEOOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    const cleanup = trackPageView(location.pathname);
    return () => {
      if (cleanup) cleanup();
    };
  }, [location.pathname]);

  return null;
};
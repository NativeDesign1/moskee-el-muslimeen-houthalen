import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Component to track page views automatically on route changes
 */
export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Get page title from document or generate from path
    const pageTitle = document.title || location.pathname;
    
    // Track the page view
    trackPageView(location.pathname, pageTitle);
  }, [location]);

  return null; // This component doesn't render anything
}

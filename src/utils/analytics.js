import { supabase } from '../supabaseClient';

/**
 * Track a page view in Supabase
 * @param {string} pagePath - The current page path (e.g., '/kennisbank')
 * @param {string} pageTitle - The page title
 */
export async function trackPageView(pagePath, pageTitle) {
  try {
    // Get user agent and referrer
    const userAgent = navigator.userAgent;
    const referrer = document.referrer || 'direct';

    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    // Detect browser
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Get geolocation data (IP-based)
    let country = null;
    let city = null;
    let ipAddress = null;
    
    try {
      const geoResponse = await fetch('https://ipapi.co/json/');
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        country = geoData.country_name || null;
        city = geoData.city || null;
        ipAddress = geoData.ip || null;
        console.log('Geolocation data:', { country, city, ipAddress });
      } else {
        console.warn('Geolocation API response not OK:', geoResponse.status);
      }
    } catch (geoError) {
      console.warn('Could not fetch geolocation:', geoError);
    }

    // Insert page view
    const dataToInsert = {
      page_path: pagePath,
      page_title: pageTitle,
      referrer: referrer,
      user_agent: userAgent,
      device_type: deviceType,
      browser: browser,
      ip_address: ipAddress,
      country: country,
      city: city
    };
    
    console.log('Inserting page view:', dataToInsert);
    
    const { error } = await supabase
      .from('page_views')
      .insert([dataToInsert]);

    if (error) {
      console.error('Error tracking page view:', error);
    } else {
      console.log('Page view tracked successfully with geo data');
    }
  } catch (err) {
    console.error('Error in trackPageView:', err);
  }
}

/**
 * Get analytics statistics (admin only)
 */
export async function getAnalytics() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get total views
    const { count: totalViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // Get views today
    const { count: viewsToday, data: todayData } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', today);

    // Get views this week
    const { count: viewsThisWeek, data: weekData } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', weekAgo);

    // Get views this month
    const { count: viewsThisMonth, data: monthData } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', monthAgo);

    // Calculate unique visitors
    const uniqueVisitorsToday = new Set(todayData?.map(v => v.ip_address) || []).size;
    const uniqueVisitorsWeek = new Set(weekData?.map(v => v.ip_address) || []).size;
    const uniqueVisitorsMonth = new Set(monthData?.map(v => v.ip_address) || []).size;

    // Get daily stats (last 30 days)
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('*')
      .limit(30);

    // Get page stats
    const { data: pageStats } = await supabase
      .from('page_stats')
      .select('*')
      .limit(10);

    // Device breakdown
    const { data: allViews } = await supabase
      .from('page_views')
      .select('device_type, browser, referrer, country, city, created_at')
      .gte('created_at', monthAgo);

    const deviceStats = {};
    const browserStats = {};
    const referrerStats = {};
    const countryStats = {};
    const cityStats = {};
    const hourlyStats = Array(24).fill(0);

    allViews?.forEach(view => {
      // Device stats
      deviceStats[view.device_type] = (deviceStats[view.device_type] || 0) + 1;
      
      // Browser stats
      browserStats[view.browser] = (browserStats[view.browser] || 0) + 1;
      
      // Referrer stats
      const ref = view.referrer === 'direct' ? 'Direct' : new URL(view.referrer || 'direct://').hostname || 'Direct';
      referrerStats[ref] = (referrerStats[ref] || 0) + 1;
      
      // Country stats
      if (view.country) {
        countryStats[view.country] = (countryStats[view.country] || 0) + 1;
      }
      
      // City stats
      if (view.city) {
        cityStats[view.city] = (cityStats[view.city] || 0) + 1;
      }
      
      // Hourly stats
      const hour = new Date(view.created_at).getHours();
      hourlyStats[hour]++;
    });

    // Convert to arrays and sort
    const deviceBreakdown = Object.entries(deviceStats)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    const browserBreakdown = Object.entries(browserStats)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    const topReferrers = Object.entries(referrerStats)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topCities = Object.entries(cityStats)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalViews: totalViews || 0,
      viewsToday: viewsToday || 0,
      viewsThisWeek: viewsThisWeek || 0,
      viewsThisMonth: viewsThisMonth || 0,
      uniqueVisitorsToday,
      uniqueVisitorsWeek,
      uniqueVisitorsMonth,
      dailyStats: dailyStats || [],
      pageStats: pageStats || [],
      deviceBreakdown,
      browserBreakdown,
      topReferrers,
      topCountries,
      topCities,
      hourlyStats
    };
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return null;
  }
}

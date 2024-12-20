import { supabase } from "@/integrations/supabase/client";

interface PageMetrics {
  visits: number;
  timeOnPage: number;
  bounced: boolean;
}

export const trackPageView = async (pagePath: string) => {
  try {
    const startTime = Date.now();
    
    // Update visit count
    const { data: existingMetrics, error: fetchError } = await supabase
      .from('seo_metrics')
      .select('*')
      .eq('page_path', pagePath)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching metrics:', fetchError);
      return;
    }

    if (existingMetrics) {
      const { error: updateError } = await supabase
        .from('seo_metrics')
        .update({ visits: existingMetrics.visits + 1 })
        .eq('page_path', pagePath);

      if (updateError) {
        console.error('Error updating metrics:', updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('seo_metrics')
        .insert([{ page_path: pagePath, visits: 1 }]);

      if (insertError) {
        console.error('Error inserting metrics:', insertError);
      }
    }

    // Track time on page when user leaves
    const handleLeave = async () => {
      const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds
      
      const { error: timeUpdateError } = await supabase
        .from('seo_metrics')
        .update({
          avg_time_on_page: timeSpent,
          bounce_rate: document.referrer ? 0 : 1
        })
        .eq('page_path', pagePath);

      if (timeUpdateError) {
        console.error('Error updating time metrics:', timeUpdateError);
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    
    return () => {
      window.removeEventListener('beforeunload', handleLeave);
    };
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};
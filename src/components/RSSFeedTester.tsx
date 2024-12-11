import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export function RSSFeedTester() {
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  useEffect(() => {
    fetchLastUpdateTime();
  }, []);

  const fetchLastUpdateTime = async () => {
    try {
      const { data, error } = await supabase
        .from('rss_sources')
        .select('last_fetch_at')
        .order('last_fetch_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching last update time:', error);
        return;
      }

      if (data && data.length > 0) {
        setLastFetchTime(data[0].last_fetch_at);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="text-sm text-gray-600">
        {lastFetchTime ? (
          <>Last RSS fetch: {new Date(lastFetchTime).toLocaleString()}</>
        ) : (
          'No RSS feeds fetched yet'
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        (RSS feeds are automatically fetched every hour)
      </div>
    </div>
  );
}
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function RSSFeedTester() {
  const [isLoading, setIsLoading] = useState(false);

  const testFetch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rss-articles');
      
      if (error) {
        console.error('Error fetching RSS:', error);
        toast.error('Failed to fetch RSS feeds');
        return;
      }

      console.log('RSS Fetch Response:', data);
      toast.success('RSS feeds fetched successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching RSS feeds');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={testFetch}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90"
      >
        {isLoading ? 'Fetching...' : 'Test RSS Feed Fetch'}
      </Button>
    </div>
  );
}
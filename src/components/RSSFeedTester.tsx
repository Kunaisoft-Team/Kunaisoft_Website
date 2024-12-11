import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function RSSFeedTester() {
  const [isLoading, setIsLoading] = useState(false);

  const testFetch = async () => {
    setIsLoading(true);
    try {
      console.log('Initiating RSS feed fetch...');
      const { data, error } = await supabase.functions.invoke('fetch-rss-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {} // Empty body but required for POST request
      });
      
      if (error) {
        console.error('Error fetching RSS:', error);
        toast.error('Failed to fetch RSS feeds');
        return;
      }

      console.log('RSS Fetch Response:', data);
      
      if (data.results && Array.isArray(data.results)) {
        const successCount = data.results.filter(r => r.status === 'success').length;
        const errorCount = data.results.filter(r => r.status === 'error').length;
        
        if (successCount > 0) {
          toast.success(`Successfully fetched ${successCount} RSS feed${successCount !== 1 ? 's' : ''}`);
        }
        if (errorCount > 0) {
          toast.error(`Failed to fetch ${errorCount} RSS feed${errorCount !== 1 ? 's' : ''}`);
        }
      } else {
        toast.success('RSS feeds processed successfully');
      }
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
import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function PersonalizedContent() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-recommendations', {
          body: { userId: userId || 'anonymous' },
        });

        if (error) throw error;
        return data.suggestions;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to load recommendations",
          variant: "destructive",
        });
        return null;
      }
    },
  });

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 bg-white/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {userId ? "Personalized Recommendations" : "Featured Services"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="prose prose-primary">
            {recommendations && (
              <div dangerouslySetInnerHTML={{ __html: recommendations }} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
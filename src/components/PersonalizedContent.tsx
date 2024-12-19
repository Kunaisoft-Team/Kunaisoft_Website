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
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-up">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {userId ? "Personalized Recommendations" : "Featured Services"}
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              {userId 
                ? "Tailored suggestions based on your interests and preferences"
                : "Discover our most popular digital solutions"
              }
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <div className="prose prose-primary max-w-none">
                {recommendations && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: recommendations }}
                    className="text-gray-700 leading-relaxed space-y-4"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
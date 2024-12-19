import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

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
    <section className="py-16 relative overflow-hidden">
      {/* Background with gradient and blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <Card className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-up rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full transform translate-x-32 -translate-y-32 pointer-events-none" />
          
          <CardHeader className="space-y-4 text-center relative z-10 pt-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                {userId ? "Personalized Recommendations" : "Featured Services"}
              </CardTitle>
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              {userId 
                ? "Discover tailored solutions based on your unique needs and preferences"
                : "Explore our most impactful digital solutions designed to transform your business"
              }
            </p>
          </CardHeader>

          <CardContent className="p-8 relative z-10">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full bg-primary/5" />
                <Skeleton className="h-4 w-3/4 bg-primary/5" />
                <Skeleton className="h-4 w-5/6 bg-primary/5" />
              </div>
            ) : (
              <div className="prose prose-primary max-w-none">
                {recommendations && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: recommendations }}
                    className="text-gray-700 leading-relaxed space-y-6 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-primary [&>h3]:mb-3"
                  />
                )}
              </div>
            )}
          </CardContent>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/5 via-primary/5 to-transparent rounded-full transform -translate-x-32 translate-y-32 pointer-events-none" />
        </Card>
      </div>
    </section>
  );
}
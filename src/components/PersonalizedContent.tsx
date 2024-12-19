import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RecommendationCard } from "./recommendations/RecommendationCard";
import { RecommendationHeader } from "./recommendations/RecommendationHeader";
import { LoadingCards } from "./recommendations/LoadingCards";
import { parseRecommendations } from "@/utils/recommendationParser";

const defaultRecommendations = `
  <h3>AI-Powered Development</h3>
  <p>Transform your development process with our cutting-edge AI tools and methodologies.</p>
  <ul>
    <li>Accelerate your project timeline by up to 40%</li>
    <li>Reduce development costs while maintaining high quality</li>
    <li>Access intelligent code suggestions and automated testing</li>
    <li>Implement continuous integration and deployment</li>
  </ul>

  <h3>Smart Business Solutions</h3>
  <p>Leverage data-driven insights to make informed business decisions.</p>
  <ul>
    <li>Implement predictive analytics for better resource allocation</li>
    <li>Automate routine tasks and improve operational efficiency</li>
    <li>Get real-time performance monitoring and optimization</li>
    <li>Enhance decision-making with AI-powered insights</li>
  </ul>

  <h3>Digital Transformation</h3>
  <p>Modernize your business with our comprehensive digital solutions.</p>
  <ul>
    <li>Seamlessly integrate AI into your existing workflows</li>
    <li>Enhance customer experience with personalized interactions</li>
    <li>Stay ahead of the competition with innovative technologies</li>
    <li>Scale your digital infrastructure efficiently</li>
  </ul>
`;

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
        console.log('Fetching recommendations for user:', userId || 'anonymous');
        const { data, error } = await supabase.functions.invoke('generate-recommendations', {
          body: { userId: userId || 'anonymous' },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        if (data?.suggestions && typeof data.suggestions === 'string') {
          return data.suggestions;
        }

        console.log('Falling back to default recommendations');
        return defaultRecommendations;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to load recommendations, showing default content",
          variant: "destructive",
        });
        return defaultRecommendations;
      }
    },
    retry: 1,
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
  });

  const sections = recommendations ? parseRecommendations(recommendations) : [];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <RecommendationHeader isAuthenticated={!!userId} />

        {isLoading ? (
          <LoadingCards />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <RecommendationCard
                key={index}
                index={index}
                title={section.title}
                description={section.description}
                content={section.content}
                icon={section.icon}
              />
            ))}
          </div>
        )}

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 via-primary/5 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>
    </section>
  );
}
import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Star, Award, Gift, Diamond, CircleCheck } from "lucide-react";

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

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        // If we have data and it's properly formatted, use it
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
  });

  // Default recommendations with structured content
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

  const renderRecommendationCards = (content: string) => {
    // Parse the HTML content into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extract sections (assuming h3 headers are used as section breaks)
    const sections = [];
    let currentSection = null;
    
    doc.body.childNodes.forEach((node) => {
      if (node.nodeName === 'H3') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: node.textContent,
          content: [],
          icon: getRandomIcon()
        };
      } else if (currentSection && node.nodeName === 'UL') {
        // Extract list items
        Array.from(node.children).forEach(li => {
          if (li.textContent?.trim()) {
            currentSection.content.push(li.textContent.trim());
          }
        });
      } else if (currentSection && node.nodeName === 'P') {
        // Add paragraph as a description
        currentSection.description = node.textContent?.trim();
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map((section, index) => (
      <Card 
        key={index}
        className="bg-white/90 backdrop-blur-sm border border-primary/10 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            {section.icon}
          </div>
          <CardTitle className="text-xl font-semibold text-primary">
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {section.description && (
            <p className="text-gray-600 mb-4">{section.description}</p>
          )}
          <ul className="space-y-2 text-gray-600">
            {section.content.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CircleCheck className="h-5 w-5 text-primary/60 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ));
  };

  const getRandomIcon = () => {
    const icons = [
      <Star className="h-6 w-6 text-primary" />,
      <Award className="h-6 w-6 text-primary" />,
      <Gift className="h-6 w-6 text-primary" />,
      <Diamond className="h-6 w-6 text-primary" />,
      <Sparkles className="h-6 w-6 text-primary" />
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12 relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              {userId ? "Personalized Recommendations" : "Featured Services"}
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {userId 
              ? "Discover tailored solutions based on your unique needs and preferences"
              : "Explore our most impactful digital solutions designed to transform your business"
            }
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/80">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 bg-primary/5" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-primary/5" />
                    <Skeleton className="h-4 w-5/6 bg-primary/5" />
                    <Skeleton className="h-4 w-4/6 bg-primary/5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations && renderRecommendationCards(recommendations)}
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 via-primary/5 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>
    </section>
  );
}
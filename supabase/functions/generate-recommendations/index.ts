import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();
    console.log('Generating recommendations for user:', userId);

    let recommendations = null;
    let preferences = null;

    // Only fetch user-specific data if authenticated
    if (userId !== 'anonymous') {
      // Get user's interaction history
      const { data: userRecommendations, error: recError } = await supabaseClient
        .from('recommendations')
        .select('content_type, content_id, score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recError) {
        console.error('Error fetching recommendations:', recError);
      } else {
        recommendations = userRecommendations;
      }

      // Get user's preferences
      const { data: userPreferences, error: prefError } = await supabaseClient
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();
      
      if (prefError) {
        console.error('Error fetching preferences:', prefError);
      } else {
        preferences = userPreferences;
      }

      console.log('User data fetched:', { recommendations, preferences });
    }

    // Generate personalized content based on user data
    const content = generatePersonalizedContent(recommendations, preferences);

    return new Response(JSON.stringify({ suggestions: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalizedContent(recommendations: any[] | null, preferences: any | null) {
  // This is a simplified version. In a real application, you would use this data
  // to generate truly personalized content, possibly using AI or complex business logic
  const topics = recommendations?.map(r => r.content_type) || [];
  const userPrefs = preferences?.preferences || {};

  // For now, return a basic template with some conditional content
  return `
    <h3>Customized Development Solutions</h3>
    <p>Tailored development services based on your unique requirements.</p>
    <ul>
      <li>Specialized ${topics.includes('frontend') ? 'frontend' : 'full-stack'} development expertise</li>
      <li>Custom solutions designed for your specific industry</li>
      <li>Scalable architecture planning and implementation</li>
      <li>Continuous support and maintenance</li>
    </ul>

    <h3>Strategic Technology Consulting</h3>
    <p>Expert guidance for your digital transformation journey.</p>
    <ul>
      <li>Technology stack optimization and modernization</li>
      <li>Performance optimization and scaling strategies</li>
      <li>Security best practices and implementation</li>
      <li>Cloud infrastructure planning and deployment</li>
    </ul>

    <h3>Innovation & Growth</h3>
    <p>Cutting-edge solutions for business growth.</p>
    <ul>
      <li>AI and machine learning integration</li>
      <li>Data-driven decision making tools</li>
      <li>Automated workflow optimization</li>
      <li>Scalable cloud solutions</li>
    </ul>
  `;
}
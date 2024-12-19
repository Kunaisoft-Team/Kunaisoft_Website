import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, userPreferences } = await req.json();

    // Get user's interaction history
    const { data: recommendations } = await supabaseClient
      .from('recommendations')
      .select('content_type, content_id, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's preferences
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    // Generate personalized content using GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that provides personalized content recommendations based on user preferences and history.'
          },
          {
            role: 'user',
            content: `Based on these user preferences: ${JSON.stringify(preferences)} and interaction history: ${JSON.stringify(recommendations)}, suggest relevant content and services from our digital agency. Focus on AI Tools, Development Services, and Virtual Assistance.`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const suggestions = aiResponse.choices[0].message.content;

    // Store the recommendations
    await supabaseClient.from('recommendations').insert([
      {
        user_id: userId,
        content_type: 'ai_suggestion',
        score: 1.0,
        content_id: null // This is a general recommendation
      }
    ]);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
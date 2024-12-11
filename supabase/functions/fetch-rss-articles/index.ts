import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { fetchRSSSources, fetchAndParseRSSFeed, updateLastFetchTime } from './utils/fetch.ts';

// Mock RSS entry for testing
const mockRSSEntry = {
  title: { _text: "Test RSS Article" },
  description: { _text: "This is a test article to verify post creation." },
  content: { _text: "<p>This is the full content of the test article.</p>" },
  link: { _text: "https://example.com/test-article" },
  pubDate: { _text: new Date().toISOString() }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with null checks
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, { 
      auth: { persistSession: false } 
    });

    console.log('Fetching existing RSS bot profile...');
    
    // Get the single RSS bot profile with proper error handling
    let botProfile;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('is_bot', true)
        .eq('full_name', 'RSS Bot')
        .single();

      if (error) {
        console.error('Database error fetching bot profile:', error);
        throw error;
      }
      
      if (!data || !data.id) {
        console.error('No valid bot profile found');
        throw new Error('No valid bot profile found');
      }
      
      botProfile = data;
    } catch (error) {
      console.error('Error in bot profile fetch:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch bot profile', 
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const botId = botProfile.id;
    if (!botId) {
      return new Response(
        JSON.stringify({ error: 'Invalid bot profile ID' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    console.log('Using Bot ID:', botId);

    // Test post creation with mock data
    try {
      console.log('Creating test post with mock RSS data...');
      const timestamp = new Date().getTime();
      const uniqueSlug = `${mockRSSEntry.title._text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
      
      const { data: post, error: postError } = await supabaseClient
        .from('posts')
        .insert({
          title: mockRSSEntry.title._text,
          content: mockRSSEntry.content._text,
          excerpt: mockRSSEntry.description._text.substring(0, 200),
          author_id: botId,
          slug: uniqueSlug,
          meta_description: mockRSSEntry.description._text.substring(0, 160),
          reading_time_minutes: 5
        })
        .select()
        .single();

      if (postError) {
        console.error('Error creating test post:', postError);
        throw postError;
      }

      if (!post) {
        throw new Error('Test post creation failed - no post returned');
      }

      console.log('Successfully created test post:', post);

      return new Response(
        JSON.stringify({ 
          message: 'Test post created successfully',
          post 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );

    } catch (error) {
      console.error('Error in test post creation:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create test post', 
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

  } catch (error) {
    console.error('Error in main function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
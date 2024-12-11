import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RSS_BOT_ID = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for RSS Bot

export async function getRSSBotProfile(supabase: any) {
  console.log('Getting or creating RSS Bot profile...');
  
  try {
    // Check if RSS Bot profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', RSS_BOT_ID)
      .single();

    if (profileError) {
      console.log('Creating new RSS Bot profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: RSS_BOT_ID,
          full_name: 'RSS Bot',
          avatar_url: null,
          is_bot: true  // Set is_bot to true for the RSS bot
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating RSS bot profile:', createError);
        throw createError;
      }
      
      console.log('RSS Bot profile created successfully:', newProfile);
      return newProfile.id;
    }

    // If profile exists but might need the is_bot flag updated
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_bot: true })
      .eq('id', RSS_BOT_ID);

    if (updateError) {
      console.error('Error updating RSS bot profile:', updateError);
      throw updateError;
    }

    console.log('Using existing RSS Bot profile:', profile);
    return profile.id;
  } catch (error) {
    console.error('Error in getRSSBotProfile:', error);
    throw error;
  }
}
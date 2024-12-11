import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RSS_BOT_ID = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for Kunaisoft News bot

export async function getRSSBotProfile(supabase: any) {
  console.log('Getting or creating Kunaisoft News profile...');
  
  try {
    // Check if Kunaisoft News profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', RSS_BOT_ID)
      .single();

    if (profileError) {
      console.log('Creating new Kunaisoft News profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: RSS_BOT_ID,
          full_name: 'Kunaisoft News',
          avatar_url: null,
          is_bot: true  // Set is_bot to true for the Kunaisoft News bot
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating Kunaisoft News profile:', createError);
        throw createError;
      }
      
      console.log('Kunaisoft News profile created successfully:', newProfile);
      return newProfile.id;
    }

    // If profile exists but might need the is_bot flag updated
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_bot: true,
        full_name: 'Kunaisoft News'
      })
      .eq('id', RSS_BOT_ID);

    if (updateError) {
      console.error('Error updating Kunaisoft News profile:', updateError);
      throw updateError;
    }

    console.log('Using existing Kunaisoft News profile:', profile);
    return profile.id;
  } catch (error) {
    console.error('Error in getRSSBotProfile:', error);
    throw error;
  }
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getRSSBotProfile(supabase: any) {
  console.log('Getting or creating RSS Bot profile...');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', 'RSS Bot')
    .single();

  if (profileError) {
    console.log('Creating new RSS Bot profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'RSS Bot',
        avatar_url: null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating RSS bot profile:', createError);
      throw createError;
    }
    return newProfile.id;
  }

  return profile.id;
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getRSSBotProfile(supabase: any) {
  console.log('Getting or creating RSS bot profile...');
  
  // Try to find existing bot profile
  const { data: existingBot } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', 'RSS Bot')
    .eq('is_bot', true)
    .single();

  if (existingBot) {
    console.log('Found existing bot profile:', existingBot.id);
    return existingBot.id;
  }

  // Create new bot profile
  const { data: newBot, error: botError } = await supabase
    .from('profiles')
    .insert({
      full_name: 'RSS Bot',
      is_bot: true,
      avatar_url: null
    })
    .select()
    .single();

  if (botError) {
    console.error('Error creating bot profile:', botError);
    throw botError;
  }

  console.log('Created new bot profile:', newBot.id);
  return newBot.id;
}
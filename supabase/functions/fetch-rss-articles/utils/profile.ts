import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getRSSBotProfile(supabase: ReturnType<typeof createClient>) {
  console.log('Getting or creating RSS bot profile...');

  // First check if bot profile already exists
  const { data: existingBot, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_bot', true)
    .eq('full_name', 'RSS Bot')
    .single();

  if (fetchError) {
    console.log('Error fetching bot profile:', fetchError);
  }

  if (existingBot) {
    console.log('Found existing bot profile:', existingBot.id);
    return existingBot.id;
  }

  // Generate a new UUID for the bot
  const botId = crypto.randomUUID();
  console.log('Generated new bot ID:', botId);

  // Create new bot profile with RETURNING clause to get the created record
  const { data: newBot, error: botError } = await supabase
    .from('profiles')
    .insert({
      id: botId,
      full_name: 'RSS Bot',
      is_bot: true,
      avatar_url: null
    })
    .select()
    .single();

  if (botError) {
    console.error('Error creating bot profile:', botError);
    throw new Error(`Failed to create bot profile: ${botError.message}`);
  }

  console.log('Created new bot profile:', newBot.id);
  return newBot.id;
}
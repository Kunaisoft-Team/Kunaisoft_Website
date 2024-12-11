import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function translateContent(
  text: string,
  targetLanguage: string = 'en'
): Promise<string> {
  try {
    // Use DeepL-like translation approach
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${Deno.env.get('DEEPL_API_KEY')}`,
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLanguage,
        preserve_formatting: true
      })
    });

    if (!response.ok) {
      console.error('Translation failed:', await response.text());
      return text; // Return original text if translation fails
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

export async function improveWriting(text: string): Promise<string> {
  try {
    // Use OpenAI to improve the writing
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a professional editor. Improve the following text while maintaining its meaning and technical accuracy. Make it more engaging and clearer for English readers.'
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error('Writing improvement failed:', await response.text());
      return text;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Writing improvement error:', error);
    return text;
  }
}
export async function translateContent(
  text: string,
  targetLanguage: string = 'en'
): Promise<string> {
  try {
    // Use OpenAI for translation
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
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain any HTML formatting if present. Keep technical terms accurate.`
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      console.error('Translation failed:', await response.text());
      return text; // Return original text if translation fails
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
        max_tokens: 1500
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
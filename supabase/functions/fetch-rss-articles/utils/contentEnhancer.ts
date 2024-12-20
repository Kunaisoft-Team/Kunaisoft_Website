import { getTopicImages } from './imageUtils.ts';

interface EnhancedContent {
  content: string;
  excerpt: string;
  readingTime: number;
}

async function rewriteWithAI(content: string, title: string, topic: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional content writer who specializes in making technical content more engaging and readable while maintaining accuracy. 
            Keep all HTML formatting intact but rewrite the content to be more friendly and engaging. 
            Maintain the same structure with h1, h2, h3 tags and other HTML elements.
            Focus on the topic: ${topic}`
          },
          {
            role: 'user',
            content: `Please rewrite this content to be more engaging and reader-friendly while keeping the HTML structure intact. Title: ${title}\n\nContent: ${content}`
          }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error rewriting content with AI:', error);
    return content; // Fallback to original content if AI rewriting fails
  }
}

export async function enhanceContent(originalContent: string, title: string, topic: string): Promise<EnhancedContent> {
  console.log('Enhancing content for:', title);
  
  // Rewrite content with AI
  const enhancedContent = await rewriteWithAI(originalContent, title, topic);
  
  // Generate excerpt
  const excerpt = generateExcerpt(enhancedContent);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(enhancedContent);

  return {
    content: enhancedContent,
    excerpt,
    readingTime
  };
}

function generateExcerpt(content: string): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  const firstParagraph = plainText.split('\n')[0] || '';
  return firstParagraph.length > 300 ? `${firstParagraph.substring(0, 297)}...` : firstParagraph;
}

function calculateReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200));
}
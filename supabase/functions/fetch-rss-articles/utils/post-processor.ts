import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContent } from './content-formatter.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';

export async function processAndStorePost(supabase: ReturnType<typeof createClient>, entry: any, botId: string, sourceUrl: string) {
  try {
    // Enhanced title extraction with fallbacks
    const title = entry?.title?._text || 
                 entry?.title || 
                 entry?.description?._text?.substring(0, 100) || 
                 `Article from ${sourceUrl}`;

    console.log('Processing entry with title:', title);

    // Extract and format content with better error handling
    const content = entry?.content?._text || 
                   entry?.description?._text || 
                   "This article's content is being processed. Please check back later.";

    console.log('Content length:', content.length);

    const keyPoints = extractKeyPoints(content);
    const quote = extractQuote(content);
    const statistics = extractStatistics(content);
    
    // Format content with proper HTML structure
    const formattedContent = `
      <article class="prose prose-lg max-w-none">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-[#1A1F2C] mb-4">${title}</h1>
          ${entry.image_url ? `
            <div class="relative h-[400px] mb-6">
              <img src="${entry.image_url}" alt="${title}" class="w-full h-full object-cover rounded-lg" />
            </div>
          ` : ''}
        </header>

        ${keyPoints.length > 0 ? `
          <section class="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 class="text-2xl font-semibold text-[#1A1F2C] mb-4">Key Takeaways</h2>
            <ul class="space-y-2">
              ${keyPoints.map(point => `<li class="flex items-start">
                <span class="text-[#9b87f5] mr-2">•</span>
                ${point}
              </li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${quote ? `
          <blockquote class="border-l-4 border-[#9b87f5] pl-4 my-8 italic text-gray-700">
            "${quote}"
          </blockquote>
        ` : ''}

        ${statistics.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            ${statistics.map(stat => `
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div class="text-2xl font-bold text-[#9b87f5]">${stat.value}</div>
                <div class="text-gray-600">${stat.label}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${formatContent(content)}
      </article>
    `;

    // Ensure minimum content length (approximately 1000 words)
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 1000) {
      console.log(`Content length (${wordCount} words) is less than 1000 words. Expanding content...`);
      formattedContent += `
        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-[#1A1F2C] mb-4">Industry Impact</h2>
          <p class="text-gray-700 leading-relaxed">
            This development represents a significant shift in how businesses approach digital transformation. 
            Organizations implementing these solutions have reported substantial improvements in efficiency and productivity.
          </p>
          
          <h3 class="text-xl font-semibold text-[#1A1F2C] mt-6 mb-3">Real-World Applications</h3>
          <p class="text-gray-700 leading-relaxed">
            Leading companies across various sectors have successfully adopted similar approaches, 
            demonstrating the versatility and effectiveness of these solutions in real-world scenarios.
          </p>

          <h3 class="text-xl font-semibold text-[#1A1F2C] mt-6 mb-3">Future Implications</h3>
          <p class="text-gray-700 leading-relaxed">
            As technology continues to evolve, we can expect to see more innovative applications and implementations.
            Organizations that embrace these changes early will be better positioned for future success.
          </p>
        </section>
      `;
    }

    // Calculate reading time (assuming average reading speed of 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // Generate a unique slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Prepare post data with enhanced error handling
    const postData = {
      title,
      content: formattedContent,
      excerpt: entry?.description?._text?.substring(0, 300) || 
              content.substring(0, 300) || 
              "Read more about this interesting article...",
      author_id: botId,
      slug,
      image_url: entry.image_url,
      reading_time_minutes: readingTimeMinutes,
      meta_description: entry?.description?._text?.substring(0, 160) || 
                       content.substring(0, 160) || 
                       `Article about ${title}`,
      meta_keywords: extractKeywords(content)
    };

    // Store in database with error handling
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error storing post:', error);
      throw error;
    }

    console.log('Successfully processed and stored post:', data.id);
    return data;
  } catch (error) {
    console.error('Error in processAndStorePost:', error);
    throw error;
  }
}

function extractKeywords(content: string): string[] {
  const commonKeywords = ['artificial intelligence', 'productivity', 'technology', 'automation', 'digital transformation'];
  const words = content.toLowerCase()
    .replace(/<[^>]*>/g, '')
    .split(/\W+/)
    .filter(word => word.length > 3);
  
  const wordFrequency: { [key: string]: number } = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  const extractedKeywords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return [...new Set([...commonKeywords, ...extractedKeywords])];
}
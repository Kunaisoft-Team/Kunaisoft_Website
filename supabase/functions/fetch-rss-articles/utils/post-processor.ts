import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function processAndStorePost(
  supabaseClient: ReturnType<typeof createClient>,
  entry: any,
  botId: string
) {
  // Handle different RSS title formats with proper formatting
  const title = entry?.title?._text || 
               entry?.title?.toString() || 
               entry?.title;
               
  if (!title?.trim()) {
    console.error('Invalid title format:', entry?.title);
    throw new Error('Invalid title');
  }

  // Extract and format the content with proper HTML structure
  let rawContent = entry?.content?._text || 
                  entry?.['content:encoded']?._text || 
                  entry?.description?._text ||
                  entry?.content?.toString() ||
                  entry?.description?.toString() ||
                  '';
  
  if (!rawContent?.trim()) {
    console.error('Invalid content format:', entry?.content);
    throw new Error('Invalid content');
  }

  // Create an enhanced content structure with proper HTML formatting
  const content = `
    <article class="prose prose-lg max-w-none">
      <!-- Hero Section -->
      <div class="mb-12 animate-fade-in">
        <div class="aspect-w-16 aspect-h-9 mb-8">
          ${entry.enclosure?.url ? 
            `<img src="${entry.enclosure.url}" alt="${title}" class="object-cover rounded-xl shadow-lg"/>` :
            `<img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" alt="Technology" class="object-cover rounded-xl shadow-lg"/>`
          }
        </div>
      </div>

      <!-- Key Takeaways Section -->
      <div class="bg-[#F2FCE2] p-6 rounded-lg mb-8 animate-fade-in">
        <h2 class="text-xl font-semibold text-[#1A1F2C] mb-4">Key Takeaways</h2>
        <ul class="list-disc pl-6 space-y-2">
          ${extractKeyPoints(rawContent).map(point => 
            `<li class="text-[#222222]">${point}</li>`
          ).join('')}
        </ul>
      </div>

      <!-- Main Content -->
      <div class="space-y-6">
        ${formatContent(rawContent)}
      </div>

      <!-- Expert Quote Section (if available) -->
      ${extractQuote(rawContent) ? `
        <blockquote class="border-l-4 border-[#9b87f5] pl-4 my-8 italic">
          ${extractQuote(rawContent)}
        </blockquote>
      ` : ''}

      <!-- Statistics Section (if available) -->
      ${extractStatistics(rawContent).length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          ${extractStatistics(rawContent).map(stat => `
            <div class="bg-[#D3E4FD] p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-[#1A1F2C]">${stat.value}</div>
              <div class="text-sm text-[#8E9196]">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;

  // Generate a clean slug with timestamp
  const timestamp = new Date().getTime();
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

  // Extract a proper excerpt with improved formatting
  const excerpt = rawContent
    .replace(/<[^>]*>/g, '')
    .substring(0, 200) + '...';

  // Calculate reading time (assuming 200 words per minute)
  const wordCount = rawContent.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extract meta keywords from content
  const metaKeywords = extractKeywords(rawContent);

  console.log('Processing post:', { 
    title, 
    contentLength: content.length, 
    slug,
    readingTimeMinutes,
    keywordsCount: metaKeywords.length
  });

  const { data: post, error: postError } = await supabaseClient
    .from('posts')
    .insert({
      title,
      content,
      slug,
      author_id: botId,
      excerpt,
      meta_description: excerpt.substring(0, 160),
      meta_keywords: metaKeywords,
      reading_time_minutes: readingTimeMinutes,
      image_url: entry?.enclosure?.url || null
    })
    .select()
    .single();

  if (postError) {
    console.error('Error storing post:', postError);
    throw postError;
  }

  return post;
}

// Helper function to extract key points from content
function extractKeyPoints(content: string): string[] {
  const sentences = content
    .replace(/<[^>]*>/g, '')
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 20)
    .slice(0, 3);
  
  return sentences.map(sentence => sentence.trim());
}

// Helper function to format content with proper HTML structure
function formatContent(content: string): string {
  // Remove existing HTML tags
  let cleanContent = content.replace(/<[^>]*>/g, '');

  // Split into paragraphs
  const paragraphs = cleanContent.split('\n\n');

  // Format paragraphs with proper HTML
  return paragraphs
    .filter(p => p.trim().length > 0)
    .map(p => {
      // Check if paragraph looks like a heading
      if (p.trim().length < 100 && p.trim().endsWith(':')) {
        return `<h2 class="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">${p.trim()}</h2>`;
      }
      return `<p class="text-[#222222] leading-relaxed">${p.trim()}</p>`;
    })
    .join('\n');
}

// Helper function to extract a relevant quote from content
function extractQuote(content: string): string | null {
  const quoteMatch = content.match(/"([^"]{20,150})"/);
  return quoteMatch ? quoteMatch[1] : null;
}

// Helper function to extract statistics from content
function extractStatistics(content: string): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  
  // Look for percentage patterns
  const percentageMatches = content.match(/\d+(\.\d+)?%/g);
  if (percentageMatches) {
    percentageMatches.forEach(match => {
      const context = content.substring(
        Math.max(0, content.indexOf(match) - 50),
        content.indexOf(match) + 50
      );
      stats.push({
        value: match,
        label: context.replace(match, '').replace(/[^a-zA-Z\s]/g, '').trim()
      });
    });
  }

  return stats.slice(0, 2); // Return at most 2 statistics
}

// Helper function to extract relevant keywords
function extractKeywords(content: string): string[] {
  const baseKeywords = ['ai tools', 'artificial intelligence', 'productivity', 'technology', 'automation'];
  
  // Extract potential keywords from content
  const words = content.toLowerCase()
    .replace(/<[^>]*>/g, '')
    .split(/\W+/)
    .filter(word => word.length > 3);
  
  const wordFrequency: { [key: string]: number } = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  // Get top frequent words
  const additionalKeywords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return [...new Set([...baseKeywords, ...additionalKeywords])];
}
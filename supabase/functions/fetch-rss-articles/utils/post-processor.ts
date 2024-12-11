import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatContent } from './content-formatter.ts';
import { extractKeyPoints, extractQuote, extractStatistics } from './content-extractors.ts';
import { createSlug } from './content.ts';

export async function processAndStorePost(supabase: ReturnType<typeof createClient>, entry: any, botId: string, sourceUrl: string) {
  try {
    // Enhanced title extraction with SEO-friendly fallbacks
    const title = entry?.title?._text || 
                 entry?.title || 
                 generateSEOTitle(entry?.description?._text, sourceUrl);

    console.log('Processing entry with title:', title);

    // Extract and format content with better error handling
    const content = entry?.content?._text || 
                   entry?.description?._text || 
                   generateDefaultContent(title, sourceUrl);

    console.log('Content length:', content.length);

    const keyPoints = extractKeyPoints(content);
    const quote = extractQuote(content);
    const statistics = extractStatistics(content);
    
    // Get a relevant image from Unsplash if none provided
    const imageUrl = entry.image_url || 
                    `https://source.unsplash.com/1600x900/?${encodeURIComponent(title.split(' ').slice(0, 3).join(' '))}`;
    
    // Format content with proper HTML structure and SEO optimization
    const formattedContent = `
      <article class="prose prose-lg max-w-none">
        <header class="mb-8 animate-fade-in">
          <h1 class="text-4xl font-bold text-[#1A1F2C] mb-4 leading-tight">${title}</h1>
          
          <div class="relative h-[500px] mb-6 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="${imageUrl}" 
              alt="${title}"
              class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
          </div>
        </header>

        ${keyPoints.length > 0 ? `
          <section class="bg-gray-50 p-6 rounded-lg mb-8 animate-fade-up">
            <h2 class="text-2xl font-semibold text-[#1A1F2C] mb-4">Key Takeaways</h2>
            <ul class="space-y-3">
              ${keyPoints.map(point => `
                <li class="flex items-start group">
                  <span class="text-[#9b87f5] mr-3 group-hover:scale-110 transition-transform">•</span>
                  <span class="text-gray-700">${point}</span>
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        ${quote ? `
          <blockquote class="my-8 pl-6 border-l-4 border-[#9b87f5] italic text-gray-700 animate-fade-up">
            <p class="text-xl leading-relaxed">"${quote}"</p>
          </blockquote>
        ` : ''}

        ${statistics.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 animate-fade-up">
            ${statistics.map(stat => `
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div class="text-2xl font-bold text-[#9b87f5]">${stat.value}</div>
                <div class="text-gray-600">${stat.label}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="content-section space-y-6">
          ${formatContent(content)}
        </div>

        <section class="mt-12 space-y-8">
          <h2 class="text-2xl font-semibold text-[#1A1F2C]">Industry Impact</h2>
          <p class="text-gray-700 leading-relaxed">
            This development represents a significant shift in how businesses approach digital transformation. 
            Organizations implementing these solutions have reported substantial improvements in efficiency and productivity.
          </p>
          
          <h3 class="text-xl font-semibold text-[#1A1F2C]">Real-World Applications</h3>
          <p class="text-gray-700 leading-relaxed">
            Leading companies across various sectors have successfully adopted similar approaches, 
            demonstrating the versatility and effectiveness of these solutions in real-world scenarios.
          </p>

          <h3 class="text-xl font-semibold text-[#1A1F2C]">Future Implications</h3>
          <p class="text-gray-700 leading-relaxed">
            As technology continues to evolve, we can expect to see more innovative applications and implementations.
            Organizations that embrace these changes early will be better positioned for future success.
          </p>
        </section>

        <footer class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <img
                src="${entry.profiles?.avatar_url || '/placeholder.svg'}"
                alt="Author"
                class="w-12 h-12 rounded-full object-cover border-2 border-[#9b87f5]"
              />
              <div>
                <p class="font-semibold text-[#1A1F2C]">${entry.profiles?.full_name || 'Kunaisoft News'}</p>
                <p class="text-sm text-gray-600">${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <button class="social-share-btn bg-[#1DA1F2] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                Share on Twitter
              </button>
              <button class="social-share-btn bg-[#4267B2] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                Share on Facebook
              </button>
            </div>
          </div>
        </footer>
      </article>
    `;

    // Calculate reading time (assuming average reading speed of 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // Generate a SEO-friendly slug
    const slug = createSlug(title);
    console.log('Generated slug:', slug);

    // Prepare post data with enhanced metadata
    const postData = {
      title,
      content: formattedContent,
      excerpt: generateExcerpt(entry?.description?._text || content),
      author_id: botId,
      slug,
      image_url: imageUrl,
      reading_time_minutes: readingTimeMinutes,
      meta_description: generateMetaDescription(entry?.description?._text || content, title),
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

function generateSEOTitle(description: string | null, sourceUrl: string): string {
  if (description) {
    // Extract main topic from description
    const words = description.split(' ').slice(0, 8);
    return `${words.join(' ')}... | Latest Industry Insights`;
  }
  return `Latest Updates from ${new URL(sourceUrl).hostname} | Industry News`;
}

function generateDefaultContent(title: string, sourceUrl: string): string {
  return `
    <h2>Latest Industry Developments</h2>
    <p>
      In a rapidly evolving digital landscape, staying informed about the latest developments
      is crucial for business success. This article explores key insights from ${new URL(sourceUrl).hostname}
      regarding ${title.toLowerCase()}.
    </p>
    <h3>Key Industry Trends</h3>
    <p>
      Recent market analysis shows significant shifts in how businesses approach digital transformation.
      Organizations are increasingly focusing on automation, efficiency, and scalable solutions.
    </p>
  `;
}

function generateExcerpt(content: string): string {
  const cleanText = content.replace(/<[^>]*>/g, '');
  return cleanText.substring(0, 300) + '...';
}

function generateMetaDescription(content: string, title: string): string {
  const cleanText = content.replace(/<[^>]*>/g, '');
  return `${title} - ${cleanText.substring(0, 150)}...`;
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
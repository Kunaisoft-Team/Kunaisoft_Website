import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extractKeyPoints, extractQuote, extractStatistics, extractKeywords } from './content-extractors.ts';
import { formatContent } from './content-formatter.ts';
import { translateContent, improveWriting } from './translation.ts';

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

  // Extract and format the content
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

  // Translate and improve content
  const translatedContent = await translateContent(rawContent);
  const improvedContent = await improveWriting(translatedContent);
  const translatedTitle = await translateContent(title);
  const improvedTitle = await improveWriting(translatedTitle);

  // Create an enhanced content structure
  const content = `
    <article class="prose prose-lg max-w-none">
      <div class="mb-12 animate-fade-in">
        <div class="aspect-w-16 aspect-h-9 mb-8">
          ${entry.enclosure?.url ? 
            `<img src="${entry.enclosure.url}" alt="${improvedTitle}" class="object-cover rounded-xl shadow-lg"/>` :
            `<img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" alt="Technology" class="object-cover rounded-xl shadow-lg"/>`
          }
        </div>
      </div>

      <div class="bg-[#F2FCE2] p-6 rounded-lg mb-8 animate-fade-in">
        <h2 class="text-xl font-semibold text-[#1A1F2C] mb-4">Key Takeaways</h2>
        <ul class="list-disc pl-6 space-y-2">
          ${extractKeyPoints(improvedContent).map(point => 
            `<li class="text-[#222222]">${point}</li>`
          ).join('')}
        </ul>
      </div>

      <div class="space-y-6">
        ${formatContent(improvedContent)}
      </div>

      ${extractQuote(improvedContent) ? `
        <blockquote class="border-l-4 border-[#9b87f5] pl-4 my-8 italic">
          ${extractQuote(improvedContent)}
        </blockquote>
      ` : ''}

      ${extractStatistics(improvedContent).length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          ${extractStatistics(improvedContent).map(stat => `
            <div class="bg-[#D3E4FD] p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-[#1A1F2C]">${stat.value}</div>
              <div class="text-sm text-[#8E9196]">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;

  // Generate slug and excerpt
  const timestamp = new Date().getTime();
  const slug = `${improvedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
  const excerpt = improvedContent
    .replace(/<[^>]*>/g, '')
    .substring(0, 200) + '...';

  // Calculate reading time
  const wordCount = improvedContent.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extract meta keywords
  const metaKeywords = extractKeywords(improvedContent);

  console.log('Processing post:', { 
    title: improvedTitle, 
    contentLength: content.length, 
    slug,
    readingTimeMinutes,
    keywordsCount: metaKeywords.length
  });

  const { data: post, error: postError } = await supabaseClient
    .from('posts')
    .insert({
      title: improvedTitle,
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
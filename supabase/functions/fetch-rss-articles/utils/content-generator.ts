import { generateSEOContent } from './seo-utils';
import { createStorytellingContent } from './storytelling-utils';
import { formatSections } from './section-formatter';

export function expandContent(baseContent: string, title: string): string {
  // If content is already long enough, just format it
  if (baseContent.length >= 800) {
    return formatSections(baseContent, title);
  }

  // Generate expanded content using storytelling and SEO
  const storyContent = createStorytellingContent(baseContent, title);
  const seoContent = generateSEOContent(storyContent, title);
  
  return formatSections(seoContent, title);
}

export function extractContent(item: any): string {
  if (!item) {
    console.error('Cannot extract content from null item');
    return '';
  }

  const content = item.content?._text || 
         item['content:encoded']?._text || 
         item.description?._text || 
         item.summary?._text || 
         '';
  
  console.log('Extracted content length:', content.length);
  return content;
}
import { formatContent } from './content-formatter';

export function expandContent(baseContent: string, title: string, category?: string): string {
  // If content is already long enough, just format it
  if (baseContent.length >= 800) {
    return formatContent(baseContent, title, category);
  }

  // Generate formatted content with category-specific sections
  return formatContent(baseContent, title, category);
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
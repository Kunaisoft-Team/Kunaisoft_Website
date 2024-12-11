import { expandContent, extractContent } from './content-generator.ts';

export function createSlug(title: string): string {
  if (!title) {
    console.error('Cannot create slug from empty title');
    return '';
  }

  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function extractImageUrl(item: any, content: string): string | null {
  if (!item) {
    console.error('Cannot extract image URL from null item');
    return null;
  }

  if (item['media:content']?.url) {
    console.log('Found media:content image:', item['media:content'].url);
    return item['media:content'].url;
  }

  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    console.log('Found enclosure image:', item.enclosure.url);
    return item.enclosure.url;
  }

  if (content) {
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      console.log('Found image in content:', imgMatch[1]);
      return imgMatch[1];
    }
  }

  console.log('No image found in RSS item');
  return null;
}

export { extractContent, expandContent };
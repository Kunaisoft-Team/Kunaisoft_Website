import { unsplashImages } from './image-sources';

export function selectRandomPlaceholderImage(): string {
  const randomIndex = Math.floor(Math.random() * unsplashImages.length);
  return `https://images.unsplash.com/${unsplashImages[randomIndex]}`;
}

export function generateContentImages(title: string, content: string): string[] {
  // Extract keywords from title and content for relevant images
  const keywords = [...new Set([
    ...title.toLowerCase().split(' '),
    ...content.toLowerCase().split(' ')
  ])].filter(word => word.length > 3);

  // Select 3-5 relevant images
  const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
  const images: string[] = [];
  
  for (let i = 0; i < numImages; i++) {
    images.push(selectRandomPlaceholderImage());
  }
  
  return images;
}

export function enhanceContentWithImages(content: string, images: string[]): string {
  if (!content || !images.length) return content;

  // Split content into paragraphs
  const paragraphs = content.split('</p>');
  
  // Insert images between paragraphs
  let enhancedContent = '';
  paragraphs.forEach((paragraph, index) => {
    if (!paragraph.trim()) return;
    
    enhancedContent += paragraph + '</p>';
    
    // Add an image after every 2-3 paragraphs
    if (index % 3 === 1 && images[Math.floor(index / 3)]) {
      const image = images[Math.floor(index / 3)];
      enhancedContent += `
        <figure class="my-8">
          <img 
            src="${image}" 
            alt="Illustration for article section" 
            class="w-full rounded-lg shadow-lg"
            loading="lazy"
          />
        </figure>
      `;
    }
  });

  return enhancedContent;
}
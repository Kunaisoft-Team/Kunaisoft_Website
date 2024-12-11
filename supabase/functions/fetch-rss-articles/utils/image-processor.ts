import { unsplashImages, categoryImages } from './image-sources.ts';

export function selectRandomPlaceholderImage(category?: string): string {
  let availableImages = unsplashImages;
  
  if (category && category in categoryImages) {
    availableImages = categoryImages[category].map(index => unsplashImages[index]);
  }
  
  const randomIndex = Math.floor(Math.random() * availableImages.length);
  return `https://images.unsplash.com/${availableImages[randomIndex]}`;
}

export function generateContentImages(title: string, content: string, category?: string): string[] {
  // Extract keywords from title and content for relevant images
  const keywords = [...new Set([
    ...title.toLowerCase().split(' '),
    ...content.toLowerCase().split(' ')
  ])].filter(word => word.length > 3);
  
  // Select 3-5 relevant images
  const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
  const images: string[] = [];
  
  for (let i = 0; i < numImages; i++) {
    images.push(selectRandomPlaceholderImage(category));
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
        <figure class="my-8 animate-fade-up">
          <img 
            src="${image}" 
            alt="Illustration for article section" 
            class="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            loading="lazy"
          />
          <figcaption class="mt-2 text-sm text-gray-600 text-center">
            ${generateImageCaption(image)}
          </figcaption>
        </figure>
      `;
    }
  });

  return enhancedContent;
}

function generateImageCaption(imageUrl: string): string {
  const captions = [
    "Visualizing the concept",
    "A practical example",
    "Modern approach in action",
    "Industry best practices",
    "Real-world application"
  ];
  
  return captions[Math.floor(Math.random() * captions.length)];
}
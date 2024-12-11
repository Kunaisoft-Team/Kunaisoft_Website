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
  const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
  const images: string[] = [];
  
  for (let i = 0; i < numImages; i++) {
    images.push(selectRandomPlaceholderImage(category));
  }
  
  return images;
}
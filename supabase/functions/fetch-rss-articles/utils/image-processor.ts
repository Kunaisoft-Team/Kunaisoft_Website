import { unsplashImages } from './image-sources';

let lastUsedImageIndices: number[] = [];

export const selectRandomPlaceholderImage = (category?: string) => {
  const availableImages = unsplashImages.filter((_, index) => !lastUsedImageIndices.includes(index));
  
  if (availableImages.length === 0) {
    lastUsedImageIndices = [];
  }

  const randomIndex = Math.floor(Math.random() * availableImages.length);
  const selectedImage = availableImages[randomIndex];
  
  const originalIndex = unsplashImages.indexOf(selectedImage);
  lastUsedImageIndices.push(originalIndex);

  return `https://images.unsplash.com/${selectedImage}`;
};

export const generateContentImages = (category?: string) => {
  return [
    selectRandomPlaceholderImage(category),
    selectRandomPlaceholderImage(category)
  ];
};
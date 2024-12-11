export const unsplashImages = [
  // Technology & Innovation
  "photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", // Tech workspace
  "photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80", // Digital abstract
  "photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80", // AI concept
  "photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1200&q=80", // Data visualization
  "photo-1526374965328-7f61d5aba04b?auto=format&fit=crop&w=1200&q=80", // Code screen
  
  // Productivity & Workspace
  "photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80", // Clean desk
  "photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80", // Laptop workspace
  "photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80", // Organized desk
  
  // Business & Strategy
  "photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", // Business meeting
  "photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80", // Strategy planning
  "photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80", // Office collaboration
];

export const categoryImages: { [key: string]: number[] } = {
  technology: [0, 1, 2, 3, 4],
  productivity: [5, 6, 7],
  business: [8, 9, 10],
};

// Keep track of recently used images to avoid repetition
let recentlyUsedImages: string[] = [];
const MAX_RECENT_IMAGES = 5;

export function selectRandomPlaceholderImage(category?: string): string {
  let availableImages = unsplashImages;
  
  if (category && category in categoryImages) {
    availableImages = categoryImages[category].map(index => unsplashImages[index]);
  }
  
  // Filter out recently used images
  const unusedImages = availableImages.filter(img => !recentlyUsedImages.includes(img));
  
  // If all images have been recently used, reset the tracking
  if (unusedImages.length === 0) {
    recentlyUsedImages = [];
    unusedImages.push(...availableImages);
  }
  
  // Select a random unused image
  const randomIndex = Math.floor(Math.random() * unusedImages.length);
  const selectedImage = unusedImages[randomIndex];
  
  // Update recently used images
  recentlyUsedImages.push(selectedImage);
  if (recentlyUsedImages.length > MAX_RECENT_IMAGES) {
    recentlyUsedImages.shift();
  }
  
  return `https://images.unsplash.com/${selectedImage}`;
}

export function generateContentImages(title: string, content: string, category?: string): string[] {
  const numImages = Math.min(Math.floor(content.length / 500) + 1, 5); // 1 image per ~500 chars, max 5
  const images: string[] = [];
  
  for (let i = 0; i < numImages; i++) {
    images.push(selectRandomPlaceholderImage(category));
  }
  
  return images;
}

export function generateHeroImage(category?: string): string {
  return selectRandomPlaceholderImage(category);
}
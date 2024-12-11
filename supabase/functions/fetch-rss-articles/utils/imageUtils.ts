export const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67',
  'https://images.unsplash.com/photo-1500673922987-e212871fec22',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b'
];

export function getRandomPlaceholderImage(): string {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
  return `${PLACEHOLDER_IMAGES[randomIndex]}?auto=format&fit=crop&w=1200&q=80`;
}
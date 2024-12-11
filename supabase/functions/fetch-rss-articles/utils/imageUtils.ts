export const TOPIC_IMAGES = {
  ai_tools: [
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6'
  ],
  ai_prompts: [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
  ],
  productivity: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22'
  ],
  getting_things_done: [
    'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
  ]
};

export function getTopicImages(topic: string): string[] {
  const topicKey = topic.toLowerCase().replace(/\s+/g, '_') as keyof typeof TOPIC_IMAGES;
  const images = TOPIC_IMAGES[topicKey] || TOPIC_IMAGES.productivity;
  return images.map(img => `${img}?auto=format&fit=crop&w=1200&q=80`);
}

export function getRandomTopicImage(topic: string): string {
  const images = getTopicImages(topic);
  return images[Math.floor(Math.random() * images.length)];
}
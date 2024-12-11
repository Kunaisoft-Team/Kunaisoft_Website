export const generateIntroduction = (title: string, category: string) => {
  const introductions = {
    ai_tools: `In today's rapidly evolving technological landscape, artificial intelligence tools are revolutionizing how businesses operate. This comprehensive guide explores the latest developments in AI tools and their practical applications for enhancing productivity and decision-making processes.`,
    ai_prompts: `The art of crafting effective AI prompts has become a crucial skill in today's technology-driven world. This in-depth analysis explores advanced techniques and best practices for maximizing the potential of AI interactions through strategic prompt engineering.`,
    productivity: `In an era where efficiency is paramount, mastering productivity tools and techniques can significantly impact business success. This comprehensive guide examines cutting-edge approaches to enhancing workplace productivity and achieving optimal results.`,
    getting_things_done: `Effective task management and workflow optimization are essential for success in today's fast-paced business environment. This detailed exploration reveals proven strategies for implementing the GTD methodology and maximizing personal and team productivity.`
  };

  return `
    <section class="prose prose-lg max-w-none mb-12 animate-fade-up">
      <p class="text-xl leading-relaxed text-gray-600 mb-8">
        ${introductions[category as keyof typeof introductions] || 
        `Discover the latest insights and developments in ${title}. This comprehensive guide explores cutting-edge strategies and practical applications for achieving optimal results in today's dynamic business environment.`}
      </p>
    </section>
  `;
};
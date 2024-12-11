export function createStorytellingContent(content: string, title: string): string {
  const sections = [
    createNarrativeIntro(title),
    content,
    createChallengeSection(),
    createSolutionSection(),
    createSuccessStories(),
    createFutureOutlook()
  ];

  return sections.join('\n\n');
}

function createNarrativeIntro(title: string): string {
  return `
    In the rapidly evolving landscape of artificial intelligence and productivity tools, staying ahead of the curve is crucial for business success. ${title} represents a significant milestone in how we approach work and innovation. Let's explore the transformative impact of these tools and how they're reshaping the future of work.
  `;
}

function createChallengeSection(): string {
  return `
    The Challenge:

    Organizations today face unprecedented challenges in maintaining productivity and efficiency. The sheer volume of tasks, coupled with increasing complexity, creates bottlenecks that traditional approaches struggle to address. Teams need smarter solutions that can scale with their growing demands while maintaining quality and consistency.
  `;
}

function createSolutionSection(): string {
  return `
    The Solution:

    Modern AI tools offer a compelling answer to these challenges. By leveraging advanced algorithms and machine learning capabilities, these solutions can automate routine tasks, enhance decision-making processes, and unlock new levels of productivity. The key lies in their ability to learn and adapt to specific use cases while maintaining flexibility for various applications.
  `;
}

function createSuccessStories(): string {
  return `
    Success Stories:

    Leading organizations across industries have already embraced these innovative solutions, achieving remarkable results. From small startups to enterprise-level corporations, the impact is clear: increased efficiency, reduced operational costs, and improved team satisfaction. These success stories serve as powerful testimonials to the transformative potential of AI-driven tools.
  `;
}

function createFutureOutlook(): string {
  return `
    Looking Ahead:

    The future of AI tools and productivity solutions looks incredibly promising. As technology continues to evolve, we can expect even more sophisticated features and capabilities. Organizations that embrace these innovations today will be well-positioned to thrive in tomorrow's competitive landscape. The key to success lies in staying informed, adaptable, and ready to leverage new opportunities as they emerge.
  `;
}
export function expandContent(baseContent: string, title: string, category?: string): string {
  // If content is already long enough, just format it
  if (baseContent.length >= 800) {
    return formatSections(baseContent, title);
  }

  const categoryDescriptions = {
    ai_tools: "artificial intelligence tools and their practical applications",
    ai_prompts: "effective prompt engineering and AI interaction strategies",
    productivity: "productivity enhancement methods and tools",
    getting_things_done: "task management and workflow optimization",
    business_contributions: "business growth and organizational development",
    people_contact_networks: "professional networking and relationship building"
  };

  const description = category ? categoryDescriptions[category as keyof typeof categoryDescriptions] : "technology and innovation";

  // Generate category-specific content sections
  const sections = [
    {
      title: 'Overview',
      content: `${title} provides valuable insights into ${description}. ${baseContent}`
    },
    {
      title: 'Key Insights',
      content: generateCategoryInsights(category)
    },
    {
      title: 'Practical Applications',
      content: generatePracticalApplications(category)
    },
    {
      title: 'Industry Impact',
      content: generateIndustryImpact(category)
    },
    {
      title: 'Future Perspectives',
      content: generateFuturePerspectives(category)
    },
    {
      title: 'Conclusion',
      content: `By understanding and implementing these ${description} strategies, organizations can achieve better results and maintain competitive advantage in their respective fields.`
    }
  ];

  return sections.map(section => 
    `## ${section.title}\n\n${section.content}`
  ).join('\n\n');
}

function generateCategoryInsights(category?: string): string {
  const insights = {
    ai_tools: "AI tools are revolutionizing how businesses operate, offering unprecedented automation capabilities and decision-making support. Understanding these tools' potential and limitations is crucial for successful implementation.",
    ai_prompts: "Effective prompt engineering is becoming a crucial skill in the AI era. Well-crafted prompts can significantly improve AI output quality and consistency.",
    productivity: "Modern productivity tools and methodologies are transforming workplace efficiency. Organizations are seeing substantial improvements in output and employee satisfaction.",
    getting_things_done: "Systematic approaches to task management and workflow optimization are essential for maintaining high productivity levels in today's fast-paced environment.",
    business_contributions: "Strategic business development requires a comprehensive understanding of market dynamics and organizational capabilities.",
    people_contact_networks: "Building and maintaining professional networks is crucial for business growth and opportunity creation."
  };

  return category ? 
    insights[category as keyof typeof insights] : 
    "Technology continues to evolve rapidly, bringing new opportunities and challenges for businesses and individuals alike.";
}

function generatePracticalApplications(category?: string): string {
  const applications = {
    ai_tools: "Organizations are implementing AI tools across various departments, from customer service to data analysis, achieving significant efficiency improvements.",
    ai_prompts: "Teams are developing prompt libraries and best practices to ensure consistent and high-quality AI interactions across their organizations.",
    productivity: "Companies are adopting integrated productivity solutions that combine task management, communication, and collaboration tools.",
    getting_things_done: "Professionals are implementing structured workflows and time management techniques to optimize their daily operations.",
    business_contributions: "Businesses are leveraging data-driven insights and strategic planning to maximize their market impact.",
    people_contact_networks: "Organizations are developing comprehensive networking strategies to build valuable professional relationships."
  };

  return category ? 
    applications[category as keyof typeof applications] : 
    "These concepts can be applied across various scenarios, from small-scale projects to enterprise-level implementations.";
}

function generateIndustryImpact(category?: string): string {
  const impacts = {
    ai_tools: "The adoption of AI tools has led to significant productivity gains, with some organizations reporting efficiency improvements of up to 40%.",
    ai_prompts: "Effective prompt engineering has become a valuable skill, with organizations investing in training and development programs.",
    productivity: "Companies implementing modern productivity tools report average efficiency gains of 25-30% in their operations.",
    getting_things_done: "Structured task management approaches have shown to reduce project completion times by up to 35%.",
    business_contributions: "Strategic business initiatives have demonstrated measurable impact on organizational growth and market position.",
    people_contact_networks: "Strong professional networks have been linked to increased business opportunities and accelerated career growth."
  };

  return category ? 
    impacts[category as keyof typeof impacts] : 
    "The impact of technology adoption varies across industries, but consistently shows positive returns on investment.";
}

function generateFuturePerspectives(category?: string): string {
  const perspectives = {
    ai_tools: "The future of AI tools points toward more sophisticated, context-aware solutions that can handle increasingly complex tasks.",
    ai_prompts: "Prompt engineering is expected to evolve with AI capabilities, requiring more nuanced and sophisticated approaches.",
    productivity: "Future productivity tools will likely incorporate more AI-driven features and predictive capabilities.",
    getting_things_done: "Task management systems are evolving toward more intelligent, automated solutions that can adapt to individual work styles.",
    business_contributions: "Future business strategies will increasingly rely on data-driven decision making and automated processes.",
    people_contact_networks: "Professional networking is expected to become more integrated with digital platforms and AI-driven relationship management tools."
  };

  return category ? 
    perspectives[category as keyof typeof perspectives] : 
    "The future of technology promises even more innovative solutions and opportunities for growth.";
}

export function extractContent(item: any): string {
  if (!item) {
    console.error('Cannot extract content from null item');
    return '';
  }

  const content = item.content?._text || 
         item['content:encoded']?._text || 
         item.description?._text || 
         item.summary?._text || 
         '';
  
  console.log('Extracted content length:', content.length);
  return content;
}
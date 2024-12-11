export function createSlug(title: string): string {
  if (!title) {
    console.error('Cannot create slug from empty title');
    return '';
  }

  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  
  // If content is too short, expand it
  if (content.length < 1000) {
    return expandContent(content, item.title?._text || '');
  }
  
  return content;
}

function expandContent(baseContent: string, title: string): string {
  const sections = [
    generateIntroduction(title),
    baseContent,
    generateDetailedExplanation(),
    generatePracticalApplications(),
    generateIndustryContext(),
    generateFutureImplications(),
    generateConclusion()
  ];

  return sections.join('\n\n');
}

function generateIntroduction(title: string): string {
  return `In today's rapidly evolving digital landscape, ${title.toLowerCase()} has become increasingly crucial for businesses and professionals alike. This comprehensive guide explores the various aspects, challenges, and opportunities that arise in this dynamic field, offering valuable insights and practical strategies for success.`;
}

function generateDetailedExplanation(): string {
  return `Understanding the Core Concepts:

The foundation of successful implementation lies in grasping the fundamental principles that drive modern technological solutions. These principles encompass not only technical aspects but also strategic considerations that can significantly impact organizational outcomes.

Key Factors to Consider:

1. Scalability and Flexibility: Modern solutions must be designed with future growth in mind, ensuring they can adapt to changing requirements and increasing demands.

2. Integration Capabilities: The ability to seamlessly connect with existing systems and future technologies is crucial for long-term success.

3. Security Considerations: As digital threats evolve, maintaining robust security measures while ensuring user accessibility remains a critical balance.

4. Performance Optimization: Implementing efficient processes and utilizing appropriate tools can significantly enhance overall system performance.`;
}

function generatePracticalApplications(): string {
  return `Real-World Applications and Best Practices:

The practical implementation of these concepts requires careful consideration of various factors and adherence to industry best practices. Here's a detailed look at how organizations can effectively apply these principles:

1. Strategic Planning:
   - Conduct thorough needs assessment
   - Define clear objectives and success metrics
   - Develop comprehensive implementation roadmaps

2. Resource Optimization:
   - Allocate resources efficiently
   - Implement cost-effective solutions
   - Maximize return on investment

3. Team Collaboration:
   - Foster cross-functional communication
   - Establish clear roles and responsibilities
   - Promote knowledge sharing and skill development`;
}

function generateIndustryContext(): string {
  return `Industry Trends and Market Analysis:

Recent market research and industry analysis reveal several significant trends that are shaping the future of digital transformation:

• Increased adoption of cloud-based solutions
• Growing emphasis on data-driven decision making
• Rising importance of artificial intelligence and machine learning
• Shifting focus towards sustainable and scalable technologies

These trends indicate a clear direction for future development and innovation in the field, suggesting numerous opportunities for organizations to enhance their competitive advantage.`;
}

function generateFutureImplications(): string {
  return `Looking Ahead: Future Implications and Opportunities:

As we look towards the future, several key developments are likely to shape the evolution of digital solutions:

1. Emerging Technologies:
   - Advanced AI capabilities
   - Enhanced automation solutions
   - Improved integration frameworks

2. Market Dynamics:
   - Changing customer expectations
   - Evolving regulatory requirements
   - New competitive challenges

3. Innovation Opportunities:
   - Novel solution approaches
   - Creative problem-solving methods
   - Breakthrough technologies`;
}

function generateConclusion(): string {
  return `Conclusion:

The journey towards digital excellence requires a comprehensive understanding of both technical and strategic elements. By carefully considering the various aspects discussed in this article, organizations can better position themselves for success in an increasingly competitive digital landscape.

Remember that success in this field is not just about implementing the right solutions, but also about maintaining flexibility and adaptability in the face of changing requirements and emerging opportunities. Continuous learning and improvement remain key factors in achieving and maintaining competitive advantage.`;
}

export function extractImageUrl(item: any, content: string): string | null {
  if (!item) {
    console.error('Cannot extract image URL from null item');
    return null;
  }

  if (item['media:content']?.url) {
    console.log('Found media:content image:', item['media:content'].url);
    return item['media:content'].url;
  }

  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    console.log('Found enclosure image:', item.enclosure.url);
    return item.enclosure.url;
  }

  if (content) {
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      console.log('Found image in content:', imgMatch[1]);
      return imgMatch[1];
    }
  }

  console.log('No image found in RSS item');
  return null;
}
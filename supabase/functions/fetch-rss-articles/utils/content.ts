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

function generateIntroduction(title: string): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <p class="text-lg leading-relaxed text-gray-700">
        In today's rapidly evolving digital landscape, ${title.toLowerCase()} has become increasingly crucial for businesses and professionals alike. This comprehensive guide explores the various aspects, challenges, and opportunities that arise in this dynamic field, offering valuable insights and practical strategies for success.
      </p>
      <p class="text-lg leading-relaxed text-gray-700">
        As organizations continue to adapt to technological advancements and changing market demands, understanding and implementing effective solutions becomes paramount. This article delves deep into the key components, best practices, and emerging trends that shape the future of digital transformation.
      </p>
    </section>`;
}

function generateDetailedExplanation(): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Understanding the Core Concepts</h2>
      <p class="text-lg leading-relaxed text-gray-700 mb-6">
        The foundation of successful implementation lies in grasping the fundamental principles that drive modern technological solutions. These principles encompass not only technical aspects but also strategic considerations that can significantly impact organizational outcomes.
      </p>
      
      <h3 class="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">Key Factors to Consider</h3>
      <ul class="space-y-4 list-none pl-0">
        <li class="flex items-start space-x-3">
          <span class="text-[#9b87f5] text-xl">•</span>
          <div>
            <strong class="text-[#1A1F2C] block mb-1">Scalability and Flexibility</strong>
            <p class="text-gray-700">Modern solutions must be designed with future growth in mind, ensuring they can adapt to changing requirements and increasing demands.</p>
          </div>
        </li>
        <li class="flex items-start space-x-3">
          <span class="text-[#9b87f5] text-xl">•</span>
          <div>
            <strong class="text-[#1A1F2C] block mb-1">Integration Capabilities</strong>
            <p class="text-gray-700">The ability to seamlessly connect with existing systems and future technologies is crucial for long-term success.</p>
          </div>
        </li>
        <li class="flex items-start space-x-3">
          <span class="text-[#9b87f5] text-xl">•</span>
          <div>
            <strong class="text-[#1A1F2C] block mb-1">Security Considerations</strong>
            <p class="text-gray-700">As digital threats evolve, maintaining robust security measures while ensuring user accessibility remains a critical balance.</p>
          </div>
        </li>
      </ul>
    </section>`;
}

function generatePracticalApplications(): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Real-World Applications and Best Practices</h2>
      <p class="text-lg leading-relaxed text-gray-700 mb-6">
        The practical implementation of these concepts requires careful consideration of various factors and adherence to industry best practices. Here's a detailed look at how organizations can effectively apply these principles:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Strategic Planning</h3>
          <ul class="space-y-2">
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Conduct thorough needs assessment</span>
            </li>
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Define clear objectives and success metrics</span>
            </li>
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Develop comprehensive implementation roadmaps</span>
            </li>
          </ul>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Resource Optimization</h3>
          <ul class="space-y-2">
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Allocate resources efficiently</span>
            </li>
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Implement cost-effective solutions</span>
            </li>
            <li class="flex items-center space-x-2">
              <span class="text-[#9b87f5]">→</span>
              <span>Maximize return on investment</span>
            </li>
          </ul>
        </div>
      </div>
    </section>`;
}

function generateIndustryContext(): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Industry Trends and Market Analysis</h2>
      
      <div class="bg-[#F8F9FB] p-8 rounded-xl mb-8">
        <p class="text-lg leading-relaxed text-gray-700 mb-6">
          Recent market research and industry analysis reveal several significant trends that are shaping the future of digital transformation:
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h4 class="text-xl font-semibold text-[#1A1F2C] mb-3">Current Trends</h4>
            <ul class="space-y-2">
              <li class="flex items-center space-x-2">
                <span class="text-[#9b87f5]">•</span>
                <span>Increased adoption of cloud-based solutions</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#9b87f5]">•</span>
                <span>Growing emphasis on data-driven decision making</span>
              </li>
            </ul>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h4 class="text-xl font-semibold text-[#1A1F2C] mb-3">Future Outlook</h4>
            <ul class="space-y-2">
              <li class="flex items-center space-x-2">
                <span class="text-[#9b87f5]">•</span>
                <span>Rising importance of artificial intelligence</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#9b87f5]">•</span>
                <span>Shifting focus towards sustainable technologies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>`;
}

function generateFutureImplications(): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Looking Ahead: Future Implications and Opportunities</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Emerging Technologies</h3>
          <ul class="space-y-2">
            <li class="text-gray-700">Advanced AI capabilities</li>
            <li class="text-gray-700">Enhanced automation solutions</li>
            <li class="text-gray-700">Improved integration frameworks</li>
          </ul>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Market Dynamics</h3>
          <ul class="space-y-2">
            <li class="text-gray-700">Changing customer expectations</li>
            <li class="text-gray-700">Evolving regulatory requirements</li>
            <li class="text-gray-700">New competitive challenges</li>
          </ul>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Innovation Opportunities</h3>
          <ul class="space-y-2">
            <li class="text-gray-700">Novel solution approaches</li>
            <li class="text-gray-700">Creative problem-solving methods</li>
            <li class="text-gray-700">Breakthrough technologies</li>
          </ul>
        </div>
      </div>
    </section>`;
}

function generateConclusion(): string {
  return `
    <section class="prose prose-lg max-w-none mb-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Conclusion</h2>
      
      <div class="bg-[#F8F9FB] p-8 rounded-xl">
        <p class="text-lg leading-relaxed text-gray-700 mb-6">
          The journey towards digital excellence requires a comprehensive understanding of both technical and strategic elements. By carefully considering the various aspects discussed in this article, organizations can better position themselves for success in an increasingly competitive digital landscape.
        </p>
        
        <p class="text-lg leading-relaxed text-gray-700">
          Remember that success in this field is not just about implementing the right solutions, but also about maintaining flexibility and adaptability in the face of changing requirements and emerging opportunities. Continuous learning and improvement remain key factors in achieving and maintaining competitive advantage.
        </p>
      </div>
    </section>`;
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

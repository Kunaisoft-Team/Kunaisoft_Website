export function generateSEOContent(content: string, title: string): string {
  const keywords = extractKeywords(content);
  const enhancedContent = addKeywordRichContent(content, keywords, title);
  return enhancedContent;
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().split(/\W+/);
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function addKeywordRichContent(content: string, keywords: string[], title: string): string {
  const sections = [
    generateSEOIntroduction(title, keywords),
    content,
    generateKeywordSection(keywords),
    generateIndustryInsights(keywords),
    generateActionableSteps(keywords)
  ];

  return sections.join('\n\n');
}

function generateSEOIntroduction(title: string, keywords: string[]): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <p class="text-lg leading-relaxed text-gray-700">
        In today's rapidly evolving digital landscape, understanding ${title.toLowerCase()} has become increasingly crucial for professionals and organizations alike. This comprehensive guide explores how ${keywords.join(', ')} intersect to create powerful solutions for modern challenges.
      </p>
    </section>`;
}

function generateKeywordSection(keywords: string[]): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Key Concepts and Insights</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${keywords.map(keyword => `
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">${keyword.charAt(0).toUpperCase() + keyword.slice(1)}</h3>
            <p class="text-gray-700">Exploring the impact of ${keyword} on modern business practices and technological advancement.</p>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function generateIndustryInsights(keywords: string[]): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Industry Perspectives</h2>
      <div class="bg-[#F8F9FB] p-8 rounded-xl">
        <p class="text-lg leading-relaxed text-gray-700">
          Industry leaders are increasingly focusing on ${keywords[0]} and ${keywords[1]} to drive innovation and growth. This trend reflects a broader shift towards more integrated and efficient solutions.
        </p>
      </div>
    </section>`;
}

function generateActionableSteps(keywords: string[]): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Implementation Strategy</h2>
      <div class="space-y-4">
        ${keywords.map((keyword, index) => `
          <div class="flex items-start space-x-3">
            <span class="text-[#9b87f5] text-xl">•</span>
            <div>
              <strong class="text-[#1A1F2C] block mb-1">Step ${index + 1}: ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Integration</strong>
              <p class="text-gray-700">Implement ${keyword}-based solutions to enhance operational efficiency and drive better outcomes.</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}
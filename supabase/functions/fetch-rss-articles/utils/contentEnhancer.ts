import { PLACEHOLDER_IMAGES } from './imageUtils';

interface EnhancedContent {
  content: string;
  excerpt: string;
  readingTime: number;
}

export function enhanceContent(originalContent: string, title: string): EnhancedContent {
  // If content is too short, expand it
  if (originalContent.length < 1000) {
    const enhancedContent = generateEnhancedContent(originalContent, title);
    const excerpt = generateExcerpt(enhancedContent);
    const readingTime = calculateReadingTime(enhancedContent);
    
    return {
      content: enhancedContent,
      excerpt,
      readingTime
    };
  }
  
  // If content is long enough, just format it properly
  return {
    content: formatContent(originalContent),
    excerpt: generateExcerpt(originalContent),
    readingTime: calculateReadingTime(originalContent)
  };
}

function generateEnhancedContent(originalContent: string, title: string): string {
  // Get random images for the content
  const contentImages = getRandomContentImages(2); // Get 2 images for the content
  
  return `
    <article class="prose lg:prose-xl">
      <h1 class="text-4xl font-bold mb-8">${title}</h1>
      
      <p class="lead text-xl mb-8">
        ${generateIntroduction(originalContent)}
      </p>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Understanding the Challenge</h2>
      <p>${generateChallenge(originalContent)}</p>
      
      <figure class="my-8">
        <img src="${contentImages[0]}" alt="Illustrative image" class="rounded-lg shadow-lg"/>
        <figcaption class="text-center text-gray-600 mt-2">Visualizing the concept in action</figcaption>
      </figure>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Practical Implementation</h2>
      <p>${generateImplementation(originalContent)}</p>

      <div class="bg-gray-50 p-6 rounded-lg my-8">
        <blockquote class="text-lg italic border-l-4 border-primary pl-4">
          "${generateExpertQuote()}"
        </blockquote>
      </div>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Real-World Impact</h2>
      <p>${generateImpact(originalContent)}</p>

      <figure class="my-8">
        <img src="${contentImages[1]}" alt="Implementation example" class="rounded-lg shadow-lg"/>
        <figcaption class="text-center text-gray-600 mt-2">Real-world application example</figcaption>
      </figure>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Best Practices and Tips</h2>
      <ul class="list-disc pl-6 space-y-2">
        ${generateBestPractices().map(practice => `<li>${practice}</li>`).join('\n')}
      </ul>

      <div class="bg-gray-50 p-6 rounded-lg my-8">
        <h3 class="text-xl font-semibold mb-4">Key Statistics</h3>
        <div class="grid grid-cols-2 gap-4">
          ${generateStatistics().map(stat => `
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">${stat.value}</div>
              <div class="text-sm text-gray-600">${stat.label}</div>
            </div>
          `).join('\n')}
        </div>
      </div>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Conclusion</h2>
      <p>${generateConclusion(originalContent)}</p>

      <div class="bg-gray-50 p-6 rounded-lg my-8">
        <h3 class="text-xl font-semibold mb-4">Key Takeaways</h3>
        <ul class="list-disc pl-6 space-y-2">
          ${generateKeyTakeaways().map(takeaway => `<li>${takeaway}</li>`).join('\n')}
        </ul>
      </div>
    </article>
  `;
}

function generateIntroduction(content: string): string {
  return `In today's rapidly evolving technological landscape, ${content.slice(0, 100)}...`;
}

function generateChallenge(content: string): string {
  return `One of the key challenges in this domain is understanding how ${content.slice(0, 150)}...`;
}

function generateImplementation(content: string): string {
  return `To effectively implement these concepts, organizations need to ${content.slice(0, 200)}...`;
}

function generateImpact(content: string): string {
  return `The impact of implementing these solutions has been significant. ${content.slice(0, 150)}...`;
}

function generateExpertQuote(): string {
  const quotes = [
    "Innovation is not just about new technology, it's about solving problems and creating value",
    "The key to success in digital transformation is focusing on people first, then process, and finally technology",
    "True technological advancement comes from understanding both the technical and human aspects of implementation"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function generateBestPractices(): string[] {
  return [
    "Start with a clear understanding of your objectives",
    "Implement iterative improvements rather than big bang changes",
    "Focus on user experience and adoption",
    "Maintain clear documentation and knowledge sharing",
    "Regular monitoring and optimization of results"
  ];
}

function generateStatistics(): Array<{ value: string; label: string }> {
  return [
    { value: "85%", label: "Efficiency Improvement" },
    { value: "60%", label: "Cost Reduction" },
    { value: "3x", label: "Faster Implementation" },
    { value: "95%", label: "User Satisfaction" }
  ];
}

function generateKeyTakeaways(): string[] {
  return [
    "Understanding core concepts is crucial for successful implementation",
    "Regular monitoring and optimization lead to better results",
    "User adoption is key to achieving desired outcomes",
    "Documentation and knowledge sharing enable scalability"
  ];
}

function generateConclusion(content: string): string {
  return `In conclusion, ${content.slice(-150)}`;
}

function formatContent(content: string): string {
  return `
    <article class="prose lg:prose-xl">
      ${content}
    </article>
  `;
}

function generateExcerpt(content: string): string {
  // Remove HTML tags and get first 200 characters
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.substring(0, 200) + '...';
}

function calculateReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).length;
  return Math.ceil(words / 200); // Assuming 200 words per minute reading speed
}

function getRandomContentImages(count: number): string[] {
  const shuffled = [...PLACEHOLDER_IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(img => `${img}?auto=format&fit=crop&w=1200&q=80`);
}
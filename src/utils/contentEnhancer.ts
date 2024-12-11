import { Brain, Code, BookOpen } from "lucide-react";

interface EnhancedContent {
  content: string;
  excerpt: string;
  readingTime: number;
  takeaways: string[];
}

export function enhanceContent(originalContent: string, title: string, topic: string): EnhancedContent {
  const takeaways = generateKeyTakeaways(originalContent, topic);
  
  const enhancedContent = `
    <article class="prose lg:prose-xl">
      <div class="lead text-xl mb-8">
        ${generateIntroduction(originalContent)}
      </div>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Key Concepts</h2>
      <ul class="list-disc pl-6 space-y-4 mb-8">
        ${generateKeyPoints(originalContent).map(point => `<li>${point}</li>`).join('\n')}
      </ul>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Detailed Analysis</h2>
      <div class="space-y-4">
        ${generateDetailedContent(originalContent)}
      </div>

      <div class="bg-gray-50 p-6 rounded-lg my-8">
        <h3 class="text-xl font-semibold mb-4">Expert Insights</h3>
        <blockquote class="text-lg italic border-l-4 border-primary pl-4">
          "${generateExpertQuote(topic)}"
        </blockquote>
      </div>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Practical Applications</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        ${generatePracticalApplications(topic).map(app => `
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h4 class="font-semibold mb-2">${app.title}</h4>
            <p class="text-gray-600">${app.description}</p>
          </div>
        `).join('\n')}
      </div>
    </article>
  `;

  return {
    content: enhancedContent,
    excerpt: generateExcerpt(originalContent),
    readingTime: calculateReadingTime(enhancedContent),
    takeaways
  };
}

function generateIntroduction(content: string): string {
  const firstParagraph = content.split('\n')[0];
  return firstParagraph.length > 200 ? `${firstParagraph.slice(0, 200)}...` : firstParagraph;
}

function generateKeyPoints(content: string): string[] {
  return [
    "Understanding fundamental NLP concepts and terminology",
    "Setting up Python environment for NLP tasks",
    "Working with popular NLP libraries and tools",
    "Best practices for text preprocessing and analysis"
  ];
}

function generateDetailedContent(content: string): string {
  return content.split('\n')
    .filter(paragraph => paragraph.trim().length > 0)
    .map(paragraph => `<p class="text-gray-700 leading-relaxed">${paragraph}</p>`)
    .join('\n');
}

function generateExpertQuote(topic: string): string {
  const quotes = {
    ai_tools: "Natural Language Processing is revolutionizing how we interact with machines, making human-computer interaction more intuitive and efficient.",
    ai_prompts: "The key to effective NLP lies in understanding both the linguistic patterns and the underlying machine learning algorithms.",
    productivity: "NLP tools are becoming essential for automating text analysis and enhancing productivity in data-driven organizations.",
    getting_things_done: "By leveraging NLP techniques, we can extract meaningful insights from vast amounts of textual data in record time."
  };
  return quotes[topic as keyof typeof quotes] || quotes.ai_tools;
}

function generatePracticalApplications(topic: string): Array<{ title: string; description: string }> {
  return [
    {
      title: "Text Classification",
      description: "Automatically categorize documents and messages based on their content"
    },
    {
      title: "Sentiment Analysis",
      description: "Analyze customer feedback and social media mentions to gauge public opinion"
    }
  ];
}

function generateKeyTakeaways(content: string, topic: string): string[] {
  return [
    "Master the fundamentals of Natural Language Processing",
    "Learn to implement NLP solutions using Python",
    "Understand best practices for text preprocessing",
    "Apply NLP techniques to real-world problems"
  ];
}

function generateExcerpt(content: string): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  return `${plainText.substring(0, 160)}...`;
}

function calculateReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200));
}
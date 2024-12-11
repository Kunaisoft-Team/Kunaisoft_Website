import { getTopicImages } from './imageUtils.ts';

interface EnhancedContent {
  content: string;
  excerpt: string;
  readingTime: number;
}

export function enhanceContent(originalContent: string, title: string, topic: string): EnhancedContent {
  const contentImages = getTopicImages(topic);
  
  // Generate SEO-friendly content with proper structure
  const enhancedContent = `
    <article class="prose lg:prose-xl">
      <h1 class="text-4xl font-bold mb-8">${title}</h1>
      
      <div class="lead text-xl mb-8">
        ${generateIntroduction(originalContent)}
      </div>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Key Insights</h2>
      <ul class="list-disc pl-6 space-y-4 mb-8">
        ${generateKeyPoints(originalContent).map(point => `<li>${point}</li>`).join('\n')}
      </ul>

      <figure class="my-8">
        <img src="${contentImages[0]}" alt="Visual representation of the concept" class="rounded-lg shadow-lg"/>
        <figcaption class="text-center text-gray-600 mt-2">Understanding the core concepts</figcaption>
      </figure>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Detailed Analysis</h2>
      <div class="space-y-4">
        ${generateDetailedContent(originalContent)}
      </div>

      <figure class="my-8">
        <img src="${contentImages[1]}" alt="Practical implementation example" class="rounded-lg shadow-lg"/>
        <figcaption class="text-center text-gray-600 mt-2">Real-world application</figcaption>
      </figure>

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

      <figure class="my-8">
        <img src="${contentImages[2]}" alt="Future implications and possibilities" class="rounded-lg shadow-lg"/>
        <figcaption class="text-center text-gray-600 mt-2">Looking ahead: Future possibilities</figcaption>
      </figure>

      <h2 class="text-2xl font-semibold mt-12 mb-6">Key Takeaways</h2>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        ${generateKeyTakeaways(originalContent, topic).map(takeaway => `<li>${takeaway}</li>`).join('\n')}
      </ul>

      <div class="bg-gray-50 p-6 rounded-lg my-8">
        <h3 class="text-xl font-semibold mb-4">Impact Statistics</h3>
        <div class="grid grid-cols-2 gap-4">
          ${generateStatistics(topic).map(stat => `
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">${stat.value}</div>
              <div class="text-sm text-gray-600">${stat.label}</div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </article>
  `;

  return {
    content: enhancedContent,
    excerpt: generateExcerpt(originalContent),
    readingTime: calculateReadingTime(enhancedContent)
  };
}

function generateIntroduction(content: string): string {
  return `In today's rapidly evolving landscape of ${content.slice(0, 100)}...`;
}

function generateKeyPoints(content: string): string[] {
  return [
    `Understanding the fundamentals: ${content.slice(0, 50)}...`,
    `Key considerations for implementation`,
    `Best practices and optimization strategies`,
    `Future trends and developments`
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
    ai_tools: "AI tools are revolutionizing how we approach problem-solving and decision-making in modern business contexts.",
    ai_prompts: "The art of crafting effective AI prompts is becoming as crucial as traditional programming skills.",
    productivity: "True productivity isn't about doing more things, but doing the right things more effectively.",
    getting_things_done: "The key to getting things done is not about managing time, but managing our attention and energy."
  };
  return quotes[topic as keyof typeof quotes] || quotes.productivity;
}

function generatePracticalApplications(topic: string): Array<{ title: string; description: string }> {
  const applications = {
    ai_tools: [
      { title: "Process Automation", description: "Streamlining workflows through intelligent automation" },
      { title: "Decision Support", description: "Enhanced decision-making through data-driven insights" }
    ],
    ai_prompts: [
      { title: "Content Generation", description: "Creating engaging and relevant content efficiently" },
      { title: "Problem Solving", description: "Structuring complex problems for AI processing" }
    ],
    productivity: [
      { title: "Time Management", description: "Optimizing daily schedules for maximum efficiency" },
      { title: "Task Prioritization", description: "Focusing on high-impact activities" }
    ],
    getting_things_done: [
      { title: "Project Planning", description: "Breaking down complex projects into manageable tasks" },
      { title: "Execution Strategy", description: "Implementing effective action plans" }
    ]
  };
  return applications[topic as keyof typeof applications] || applications.productivity;
}

function generateKeyTakeaways(content: string, topic: string): string[] {
  return [
    `Understanding core concepts is crucial for successful implementation`,
    `Regular monitoring and optimization lead to better results`,
    `Integration with existing workflows enhances adoption`,
    `Continuous learning and adaptation are key to long-term success`
  ];
}

function generateStatistics(topic: string): Array<{ value: string; label: string }> {
  const stats = {
    ai_tools: [
      { value: "40%", label: "Efficiency Gain" },
      { value: "2.5x", label: "ROI Improvement" }
    ],
    ai_prompts: [
      { value: "60%", label: "Time Saved" },
      { value: "85%", label: "Accuracy Rate" }
    ],
    productivity: [
      { value: "30%", label: "Task Completion" },
      { value: "45%", label: "Time Optimization" }
    ],
    getting_things_done: [
      { value: "50%", label: "Project Success" },
      { value: "3x", label: "Delivery Speed" }
    ]
  };
  return stats[topic as keyof typeof stats] || stats.productivity;
}

function generateExcerpt(content: string): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.substring(0, 200) + '...';
}

function calculateReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200)); // Minimum 5 minutes reading time
}
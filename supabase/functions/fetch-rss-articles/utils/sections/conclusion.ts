export const generateConclusion = (category: string) => {
  const conclusions = {
    ai_tools: {
      summary: "The integration of AI tools represents a significant opportunity for organizations to enhance their operations and maintain competitiveness in an increasingly digital world.",
      takeaways: [
        "Start with clear objectives and implementation strategy",
        "Focus on user adoption and proper training",
        "Monitor and optimize based on performance metrics"
      ]
    },
    ai_prompts: {
      summary: "Mastering prompt engineering is becoming increasingly crucial for organizations looking to leverage AI effectively and efficiently.",
      takeaways: [
        "Develop structured prompt templates",
        "Implement testing and validation processes",
        "Continuously refine based on results"
      ]
    },
    productivity: {
      summary: "Implementing effective productivity strategies is essential for maintaining competitive advantage in today's fast-paced business environment.",
      takeaways: [
        "Focus on systematic implementation",
        "Measure and track progress consistently",
        "Adapt strategies based on feedback"
      ]
    },
    getting_things_done: {
      summary: "The GTD methodology provides a robust framework for managing work and life more effectively.",
      takeaways: [
        "Start with basic principles",
        "Build consistent habits",
        "Regular system maintenance"
      ]
    }
  };

  const selectedConclusion = conclusions[category as keyof typeof conclusions] || {
    summary: "Implementing these strategies effectively can lead to significant improvements in organizational performance and success.",
    takeaways: [
      "Focus on systematic implementation",
      "Monitor and measure results",
      "Continuously optimize approach"
    ]
  };

  return `
    <section class="prose prose-lg max-w-none mb-12 animate-fade-up">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">Final Thoughts</h2>
      
      <p class="text-gray-600 leading-relaxed mb-6">
        ${selectedConclusion.summary}
      </p>

      <div class="bg-gray-50 p-6 rounded-xl my-8">
        <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Key Takeaways</h3>
        <ul class="space-y-4">
          ${selectedConclusion.takeaways.map(takeaway => `
            <li class="flex items-start gap-3">
              <span class="text-primary">•</span>
              <span class="text-gray-600">${takeaway}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </section>
  `;
};
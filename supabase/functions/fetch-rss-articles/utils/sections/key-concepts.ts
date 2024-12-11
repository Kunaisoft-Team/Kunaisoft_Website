export const generateKeyConcepts = (category: string) => {
  const concepts = {
    ai_tools: {
      title: "Understanding AI Tools and Their Impact",
      concepts: [
        "Machine Learning Integration",
        "Automated Decision Making",
        "Natural Language Processing",
        "Predictive Analytics"
      ]
    },
    ai_prompts: {
      title: "Mastering AI Prompt Engineering",
      concepts: [
        "Context Optimization",
        "Response Formatting",
        "Chain-of-Thought Prompting",
        "Error Handling"
      ]
    },
    productivity: {
      title: "Core Productivity Principles",
      concepts: [
        "Time Management",
        "Task Prioritization",
        "Workflow Optimization",
        "Resource Allocation"
      ]
    },
    getting_things_done: {
      title: "GTD Methodology Fundamentals",
      concepts: [
        "Capture and Collection",
        "Processing and Organization",
        "Review Systems",
        "Action Implementation"
      ]
    }
  };

  const selectedConcepts = concepts[category as keyof typeof concepts] || {
    title: "Key Concepts and Principles",
    concepts: [
      "Strategic Implementation",
      "Performance Optimization",
      "Resource Management",
      "Success Metrics"
    ]
  };

  return `
    <section class="prose prose-lg max-w-none mb-12 animate-fade-up">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">${selectedConcepts.title}</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" 
            alt="Technology Implementation"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
        <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
            alt="Digital Innovation"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      </div>

      <div class="bg-gray-50 p-6 rounded-xl my-8">
        <ul class="space-y-4">
          ${selectedConcepts.concepts.map(concept => `
            <li class="flex items-start gap-3">
              <span class="text-primary">•</span>
              <span class="text-gray-600">${concept}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </section>
  `;
};
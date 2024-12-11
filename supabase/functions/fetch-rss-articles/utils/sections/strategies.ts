export const generateStrategies = (category: string) => {
  const strategies = {
    ai_tools: {
      title: "Implementation Strategies for AI Tools",
      phases: [
        { name: "Assessment", description: "Evaluate current workflows and identify opportunities for AI integration" },
        { name: "Tool Selection", description: "Choose appropriate AI tools based on specific needs and requirements" },
        { name: "Integration", description: "Implement selected tools with existing systems and processes" },
        { name: "Optimization", description: "Monitor performance and adjust implementation for optimal results" }
      ]
    },
    ai_prompts: {
      title: "Effective Prompt Engineering Strategies",
      phases: [
        { name: "Context Setting", description: "Establish clear context and objectives for AI interactions" },
        { name: "Structure Design", description: "Create organized and logical prompt structures" },
        { name: "Testing", description: "Validate prompt effectiveness through iterative testing" },
        { name: "Refinement", description: "Optimize prompts based on response analysis" }
      ]
    },
    productivity: {
      title: "Productivity Enhancement Strategies",
      phases: [
        { name: "Analysis", description: "Identify current productivity bottlenecks and opportunities" },
        { name: "Planning", description: "Develop comprehensive productivity improvement plans" },
        { name: "Implementation", description: "Execute planned changes and monitor progress" },
        { name: "Review", description: "Assess results and adjust strategies as needed" }
      ]
    },
    getting_things_done: {
      title: "GTD Implementation Strategies",
      phases: [
        { name: "System Setup", description: "Establish collection and processing systems" },
        { name: "Workflow Design", description: "Create efficient task management workflows" },
        { name: "Habit Formation", description: "Develop consistent GTD practices and routines" },
        { name: "Maintenance", description: "Regular system review and optimization" }
      ]
    }
  };

  const selectedStrategies = strategies[category as keyof typeof strategies] || {
    title: "Implementation Strategies",
    phases: [
      { name: "Analysis", description: "Evaluate current state and identify opportunities" },
      { name: "Planning", description: "Develop comprehensive implementation plans" },
      { name: "Execution", description: "Implement planned changes effectively" },
      { name: "Review", description: "Monitor results and optimize approach" }
    ]
  };

  return `
    <section class="prose prose-lg max-w-none mb-12 animate-fade-up">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">${selectedStrategies.title}</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        ${selectedStrategies.phases.map(phase => `
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-[#1A1F2C] mb-4">${phase.name}</h3>
            <p class="text-gray-600">${phase.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="relative h-[400px] rounded-xl overflow-hidden shadow-lg my-12">
        <img 
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80" 
          alt="Strategy Implementation"
          class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
    </section>
  `;
};
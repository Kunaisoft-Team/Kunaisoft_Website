export const generateCaseStudies = (category: string) => {
  const studies = {
    ai_tools: {
      title: "AI Tools Success Stories",
      metrics: [
        { value: "40%", label: "Productivity Increase" },
        { value: "60%", label: "Cost Reduction" },
        { value: "85%", label: "User Satisfaction" }
      ]
    },
    ai_prompts: {
      title: "Prompt Engineering Impact",
      metrics: [
        { value: "45%", label: "Response Quality Improvement" },
        { value: "55%", label: "Time Savings" },
        { value: "90%", label: "Accuracy Rate" }
      ]
    },
    productivity: {
      title: "Productivity Transformation",
      metrics: [
        { value: "35%", label: "Efficiency Gain" },
        { value: "50%", label: "Task Completion Rate" },
        { value: "80%", label: "Team Satisfaction" }
      ]
    },
    getting_things_done: {
      title: "GTD Implementation Results",
      metrics: [
        { value: "30%", label: "Stress Reduction" },
        { value: "45%", label: "Project Completion Rate" },
        { value: "75%", label: "Work-Life Balance" }
      ]
    }
  };

  const selectedStudy = studies[category as keyof typeof studies] || {
    title: "Implementation Results",
    metrics: [
      { value: "35%", label: "Performance Improvement" },
      { value: "50%", label: "Resource Optimization" },
      { value: "80%", label: "Success Rate" }
    ]
  };

  return `
    <section class="prose prose-lg max-w-none mb-12 animate-fade-up">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">${selectedStudy.title}</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        ${selectedStudy.metrics.map(metric => `
          <div class="bg-[#F8F9FB] p-6 rounded-xl">
            <div class="text-3xl font-bold text-[#9b87f5] mb-2">${metric.value}</div>
            <div class="text-gray-600">${metric.label}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
};
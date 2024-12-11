export const generatePostStructure = (
  title: string,
  heroImage: string,
  content: string,
  keyPoints: string[],
  quote: string | null,
  statistics: Array<{ value: string; label: string }>,
  authorData: {
    name: string;
    avatarUrl: string;
    date: string;
  }
) => {
  return `
    <article class="prose prose-lg max-w-none">
      <header class="mb-12 animate-fade-up">
        <div class="relative h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg">
          <img 
            src="${heroImage}" 
            alt="${title}"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      </header>

      ${keyPoints.length > 0 ? `
        <section class="my-12 p-8 bg-[#F8F9FB] rounded-xl shadow-sm animate-fade-up">
          <h2 class="text-2xl font-bold text-[#1A1F2C] mb-6">Key Takeaways</h2>
          <ul class="space-y-4">
            ${keyPoints.map(point => `
              <li class="flex items-start space-x-3">
                <span class="text-[#9b87f5] text-xl">•</span>
                <span class="text-gray-700 leading-relaxed">${point}</span>
              </li>
            `).join('')}
          </ul>
        </section>
      ` : ''}

      ${quote ? `
        <div class="my-12 animate-fade-up">
          <blockquote class="relative p-8 bg-[#F8F9FB] rounded-xl">
            <div class="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4">
              <span class="text-6xl text-[#9b87f5] opacity-25">"</span>
            </div>
            <p class="text-xl italic text-gray-700 leading-relaxed relative z-10 mt-4">
              ${quote}
            </p>
          </blockquote>
        </div>
      ` : ''}

      ${statistics.length > 0 ? `
        <section class="my-12 animate-fade-up">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${statistics.map(stat => `
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="text-3xl font-bold text-[#9b87f5] mb-2">${stat.value}</div>
                <div class="text-gray-600">${stat.label}</div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <div class="content-section space-y-8">
        ${content}
      </div>

      <footer class="mt-16 pt-8 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div class="flex items-center space-x-4">
            <img
              src="${authorData.avatarUrl}"
              alt="${authorData.name}"
              class="w-12 h-12 rounded-full object-cover border-2 border-[#9b87f5]"
            />
            <div>
              <p class="font-semibold text-[#1A1F2C]">${authorData.name}</p>
              <p class="text-sm text-gray-600">${authorData.date}</p>
            </div>
          </div>
          
          <div class="flex space-x-4">
            <button class="flex items-center space-x-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              <span>Share on Twitter</span>
            </button>
            <button class="flex items-center space-x-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              <span>Share on Facebook</span>
            </button>
          </div>
        </div>
      </footer>
    </article>
  `;
};

export const formatContentSection = (content: string): string => {
  const sections = content.split('\n\n').filter(section => section.trim());
  
  return sections.map((section, index) => {
    // Check if it's a heading
    if (section.trim().length < 100 && (section.trim().endsWith(':') || section.includes('.'))) {
      return `<h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">${section.trim().replace(':', '')}</h2>`;
    }
    
    // Regular paragraph with enhanced styling
    return `
      <div class="prose-section animate-fade-up">
        <p class="text-gray-700 leading-relaxed mb-6 text-lg">
          ${section.trim()}
        </p>
      </div>
    `;
  }).join('\n');
};
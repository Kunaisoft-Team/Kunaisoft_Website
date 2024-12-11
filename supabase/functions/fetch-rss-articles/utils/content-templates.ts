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
      <header class="mb-12">
        <div class="relative h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg">
          <img 
            src="${heroImage}" 
            alt="${title}"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 class="text-4xl sm:text-5xl font-bold mb-4">${title}</h1>
            <div class="flex items-center gap-4">
              <img
                src="${authorData.avatarUrl}"
                alt="${authorData.name}"
                class="w-12 h-12 rounded-full border-2 border-white/50"
              />
              <div>
                <p class="font-medium">${authorData.name}</p>
                <p class="text-sm opacity-75">${authorData.date}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      ${keyPoints.length > 0 ? `
        <section class="my-12 animate-fade-up">
          <h2 class="text-3xl font-bold text-[#1A1F2C] mb-8">Key Insights</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${keyPoints.map((point, index) => `
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="flex items-start gap-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                    ${index + 1}
                  </span>
                  <p class="text-gray-700">${point}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <div class="content-section space-y-8 animate-fade-up">
        ${content}
      </div>

      ${quote ? `
        <blockquote class="my-12 bg-[#F8F9FB] p-8 rounded-xl border-l-4 border-primary animate-fade-up">
          <p class="text-xl italic text-gray-700 leading-relaxed">${quote}</p>
        </blockquote>
      ` : ''}

      ${statistics.length > 0 ? `
        <section class="my-12 animate-fade-up">
          <h2 class="text-3xl font-bold text-[#1A1F2C] mb-8">Impact & Results</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${statistics.map(stat => `
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="text-3xl font-bold text-primary mb-2">${stat.value}</div>
                <div class="text-gray-600">${stat.label}</div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" 
            alt="Technical implementation"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
        <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80" 
            alt="Professional context"
            class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      </div>

      <footer class="mt-16 pt-8 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div class="flex items-center space-x-4">
            <img
              src="${authorData.avatarUrl}"
              alt="${authorData.name}"
              class="w-12 h-12 rounded-full object-cover border-2 border-primary"
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
        ${index % 3 === 0 ? `
          <div class="float-right ml-8 mb-8 w-1/3">
            <div class="relative h-[200px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-${1518770660439 + index}-4636190af475?auto=format&fit=crop&w=800&q=80" 
                alt="Section illustration"
                class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>
        ` : ''}
        <p class="text-gray-700 leading-relaxed mb-6 text-lg">
          ${section.trim()}
        </p>
      </div>
    `;
  }).join('\n');
};
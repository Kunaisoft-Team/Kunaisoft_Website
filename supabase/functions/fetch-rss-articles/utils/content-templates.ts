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
        <section class="my-12 animate-fade-up">
          <h2 class="text-3xl font-bold text-[#1A1F2C] mb-8">Key Takeaways</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80" 
                alt="Technology insights"
                class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80" 
                alt="Practical application"
                class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>

          <div class="bg-[#F8F9FB] p-8 rounded-xl shadow-sm">
            <ul class="space-y-6">
              ${keyPoints.map(point => `
                <li class="flex items-start space-x-4">
                  <span class="flex-shrink-0 w-8 h-8 bg-[#9b87f5] rounded-full flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span class="text-lg leading-relaxed text-gray-700">${point}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80" 
                alt="Productivity insights"
                class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div class="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80" 
                alt="Technical concepts"
                class="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${statistics.map(stat => `
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="text-3xl font-bold text-[#9b87f5] mb-2">${stat.value}</div>
                <div class="text-gray-600">${stat.label}</div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <div class="content-section space-y-8 animate-fade-up">
        ${content}
      </div>

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
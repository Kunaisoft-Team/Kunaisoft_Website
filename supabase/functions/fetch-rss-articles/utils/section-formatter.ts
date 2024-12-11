export function formatSections(content: string, title: string): string {
  const sections = [
    formatHeader(title),
    content,
    formatTakeaways(),
    formatConclusion()
  ];

  return sections.join('\n\n');
}

function formatHeader(title: string): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <div class="bg-gradient-to-r from-purple-100 to-indigo-100 p-8 rounded-xl mb-8">
        <h1 class="text-4xl font-bold text-[#1A1F2C] mb-4">${title}</h1>
        <p class="text-lg text-gray-700">
          Discover how this innovative approach is reshaping the future of technology and business.
        </p>
      </div>
    </section>`;
}

function formatTakeaways(): string {
  return `
    <section class="prose prose-lg max-w-none my-12">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-8">Key Takeaways</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <img src="/images/innovation.jpg" alt="Innovation" class="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-2">Innovation at Scale</h3>
          <p class="text-gray-700">Implement scalable solutions that grow with your organization.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <img src="/images/efficiency.jpg" alt="Efficiency" class="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-2">Enhanced Efficiency</h3>
          <p class="text-gray-700">Optimize processes for maximum productivity and results.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <img src="/images/future.jpg" alt="Future Ready" class="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-2">Future-Ready</h3>
          <p class="text-gray-700">Stay ahead of the curve with forward-thinking strategies.</p>
        </div>
      </div>
    </section>`;
}

function formatConclusion(): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Conclusion</h2>
      <div class="bg-[#F8F9FB] p-8 rounded-xl">
        <p class="text-lg leading-relaxed text-gray-700">
          The journey toward digital excellence requires a comprehensive understanding of both technical and strategic elements. By carefully considering the various aspects discussed in this article, organizations can better position themselves for success in an increasingly competitive landscape.
        </p>
      </div>
    </section>`;
}
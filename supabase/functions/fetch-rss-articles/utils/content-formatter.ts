export const formatContent = (content: string): string => {
  let cleanContent = content.replace(/<[^>]*>/g, '');
  const paragraphs = cleanContent.split('\n\n');

  // Add SEO-optimized headings and structure
  const formattedContent = paragraphs
    .filter(p => p.trim().length > 0)
    .map((p, index) => {
      // Create section headings for better content structure
      if (index === 0) {
        return `<p class="text-xl leading-relaxed text-gray-600 mb-8">${p.trim()}</p>`;
      }
      
      if (p.trim().length < 100 && p.trim().endsWith(':')) {
        return `<h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">${p.trim().replace(':', '')}</h2>`;
      }

      // Add emphasis to key points
      if (p.toLowerCase().includes('key takeaway') || p.toLowerCase().includes('important note')) {
        return `<div class="bg-gray-50 p-6 rounded-xl my-8">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Key Insight</h3>
          <p class="text-gray-600 leading-relaxed">${p.trim()}</p>
        </div>`;
      }

      // Format regular paragraphs
      return `<p class="text-gray-600 leading-relaxed mb-6">${p.trim()}</p>`;
    })
    .join('\n\n');

  // Add a conclusion section
  return `${formattedContent}
    <h2 class="text-3xl font-bold text-[#1A1F2C] mt-12 mb-6">Final Thoughts</h2>
    <p class="text-gray-600 leading-relaxed mb-6">
      As we've explored in this article, staying ahead in today's rapidly evolving digital landscape requires a combination of strategic thinking and practical implementation. By following these insights and best practices, you'll be better equipped to navigate the challenges and opportunities that lie ahead.
    </p>`;
};
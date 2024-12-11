export const formatContent = (content: string): string => {
  let cleanContent = content.replace(/<[^>]*>/g, '');

  const paragraphs = cleanContent.split('\n\n');

  return paragraphs
    .filter(p => p.trim().length > 0)
    .map(p => {
      if (p.trim().length < 100 && p.trim().endsWith(':')) {
        return `<h2 class="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">${p.trim()}</h2>`;
      }
      return `<p class="text-[#222222] leading-relaxed mb-6">${p.trim()}</p>`;
    })
    .join('\n');
};
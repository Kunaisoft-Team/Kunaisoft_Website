export const extractKeyPoints = (content: string): string[] => {
  const sentences = content
    .replace(/<[^>]*>/g, '')
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 20)
    .slice(0, 3);
  
  return sentences.map(sentence => sentence.trim());
};

export const extractQuote = (content: string): string | null => {
  const quoteMatch = content.match(/"([^"]{20,150})"/);
  return quoteMatch ? quoteMatch[1] : null;
};

export const extractStatistics = (content: string): Array<{ value: string; label: string }> => {
  const stats: Array<{ value: string; label: string }> = [];
  
  const percentageMatches = content.match(/\d+(\.\d+)?%/g);
  if (percentageMatches) {
    percentageMatches.forEach(match => {
      const context = content.substring(
        Math.max(0, content.indexOf(match) - 50),
        content.indexOf(match) + 50
      );
      stats.push({
        value: match,
        label: context.replace(match, '').replace(/[^a-zA-Z\s]/g, '').trim()
      });
    });
  }

  return stats.slice(0, 2);
};
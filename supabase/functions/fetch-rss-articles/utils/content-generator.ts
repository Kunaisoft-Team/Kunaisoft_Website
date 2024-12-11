export function expandContent(baseContent: string, title: string): string {
  // If content is already long enough, just format it
  if (baseContent.length >= 800) {
    return formatSections(baseContent, title);
  }

  // Basic content expansion without OpenAI
  const sections = [
    {
      title: 'Overview',
      content: baseContent
    },
    {
      title: 'Key Takeaways',
      content: `${title} provides valuable insights into modern technology and development practices. Understanding these concepts can significantly improve productivity and efficiency in software development.`
    },
    {
      title: 'Practical Applications',
      content: 'This knowledge can be applied in various real-world scenarios, from small-scale projects to enterprise-level applications. The concepts discussed here form the foundation for building robust and scalable solutions.'
    },
    {
      title: 'Conclusion',
      content: 'By implementing these practices and staying updated with the latest developments, teams can achieve better results and maintain high-quality standards in their projects.'
    }
  ];

  return sections.map(section => 
    `## ${section.title}\n\n${section.content}`
  ).join('\n\n');
}

export function extractContent(item: any): string {
  if (!item) {
    console.error('Cannot extract content from null item');
    return '';
  }

  const content = item.content?._text || 
         item['content:encoded']?._text || 
         item.description?._text || 
         item.summary?._text || 
         '';
  
  console.log('Extracted content length:', content.length);
  return content;
}
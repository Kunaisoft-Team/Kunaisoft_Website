import { generateIntroduction } from './sections/introduction';
import { generateKeyConcepts } from './sections/key-concepts';
import { generateStrategies } from './sections/strategies';
import { generateCaseStudies } from './sections/case-studies';
import { generateConclusion } from './sections/conclusion';

export const formatContent = (content: string, title: string, category?: string): string => {
  // Combine all sections
  return `
    ${generateIntroduction(title, category || '')}
    ${generateKeyConcepts(category || '')}
    ${generateStrategies(category || '')}
    ${generateCaseStudies(category || '')}
    ${generateConclusion(category || '')}
  `;
};
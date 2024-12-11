import { generateIntroduction } from './sections/introduction.ts';
import { generateKeyConcepts } from './sections/key-concepts.ts';
import { generateStrategies } from './sections/strategies.ts';
import { generateCaseStudies } from './sections/case-studies.ts';
import { generateConclusion } from './sections/conclusion.ts';

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
import { Star, Award, Gift, Diamond, Sparkles } from "lucide-react";

interface Section {
  title: string;
  description?: string;
  content: string[];
  icon: JSX.Element;
}

export function parseRecommendations(content: string): Section[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  
  doc.body.childNodes.forEach((node) => {
    if (node instanceof HTMLHeadingElement && node.tagName === 'H3') {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: node.textContent || '',
        content: [],
        icon: getRandomIcon()
      };
    } else if (currentSection && node instanceof HTMLUListElement) {
      Array.from(node.children).forEach((li) => {
        if (li instanceof HTMLLIElement && li.textContent) {
          currentSection!.content.push(li.textContent.trim());
        }
      });
    } else if (currentSection && node instanceof HTMLParagraphElement) {
      currentSection.description = node.textContent?.trim() || '';
    }
  });
  
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function getRandomIcon() {
  const icons = [
    <Star className="h-6 w-6 text-primary" />,
    <Award className="h-6 w-6 text-primary" />,
    <Gift className="h-6 w-6 text-primary" />,
    <Diamond className="h-6 w-6 text-primary" />,
    <Sparkles className="h-6 w-6 text-primary" />
  ];
  return icons[Math.floor(Math.random() * icons.length)];
}
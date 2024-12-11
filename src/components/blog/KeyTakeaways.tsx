import React from 'react';
import { Brain } from 'lucide-react';

interface KeyTakeawaysProps {
  takeaways?: string[];
}

export const KeyTakeaways = ({ takeaways = [
  "Understanding the core concepts and implementation details",
  "Best practices for optimal performance and scalability",
  "Real-world applications and practical examples"
] }: KeyTakeawaysProps) => {
  return (
    <div className="mt-16 bg-[#F1F0FB] rounded-xl p-8 animate-fade-up border border-[#E5DEFF] shadow-sm">
      <h2 className="text-2xl font-bold text-[#1A1F2C] mb-6 flex items-center gap-2">
        <span className="w-1 h-8 bg-[#9b87f5] rounded-full"></span>
        <Brain className="w-6 h-6 text-[#7E69AB]" />
        Key Takeaways
      </h2>
      <ul className="space-y-4">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
            <span className="text-[#7E69AB] text-lg flex-shrink-0">•</span>
            <span className="text-[#555555] leading-relaxed">
              {takeaway}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyTakeaways;
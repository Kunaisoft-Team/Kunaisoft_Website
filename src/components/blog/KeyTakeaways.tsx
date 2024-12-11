import React from 'react';

export const KeyTakeaways = () => {
  return (
    <div className="mt-16 bg-[#F1F0FB] rounded-xl p-8 animate-fade-in border border-[#E5DEFF] shadow-sm">
      <h2 className="text-2xl font-bold text-[#1A1F2C] mb-6 flex items-center gap-2">
        <span className="w-1 h-8 bg-[#9b87f5] rounded-full"></span>
        Key Takeaways
      </h2>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <span className="text-[#7E69AB] text-lg">•</span>
          <span className="text-[#555555] leading-relaxed">
            Understanding the core concepts and implementation details
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#7E69AB] text-lg">•</span>
          <span className="text-[#555555] leading-relaxed">
            Best practices for optimal performance and scalability
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#7E69AB] text-lg">•</span>
          <span className="text-[#555555] leading-relaxed">
            Real-world applications and practical examples
          </span>
        </li>
      </ul>
    </div>
  );
};

export default KeyTakeaways;
import { Sparkles } from "lucide-react";

interface RecommendationHeaderProps {
  isAuthenticated: boolean;
}

export function RecommendationHeader({ isAuthenticated }: RecommendationHeaderProps) {
  return (
    <div className="text-center mb-12 relative z-10">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Sparkles className="w-8 h-8 text-[#0BD255] animate-pulse" />
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#253557] via-[#0BD255] to-[#253557]">
          {isAuthenticated ? "Personalized Recommendations" : "Featured Services"}
        </h2>
        <Sparkles className="w-8 h-8 text-[#0BD255] animate-pulse" />
      </div>
      <p className="text-lg text-[#253557]/70 max-w-2xl mx-auto">
        {isAuthenticated 
          ? "Discover tailored solutions based on your unique needs and preferences"
          : "Explore our most impactful digital solutions designed to transform your business"
        }
      </p>
    </div>
  );
}
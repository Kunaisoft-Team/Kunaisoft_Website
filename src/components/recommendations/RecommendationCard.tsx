import { CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationCardProps {
  title: string;
  description?: string;
  content: string[];
  icon: React.ReactNode;
  index: number;
}

export function RecommendationCard({ title, description, content, icon, index }: RecommendationCardProps) {
  return (
    <Card 
      className="group bg-white/90 backdrop-blur-sm border border-[#253557]/10 hover:border-[#0BD255] shadow-md hover:shadow-xl hover:shadow-[#0BD255]/10 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#253557]/10 to-[#0BD255]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-[#253557] group-hover:text-[#0BD255] transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {description && (
          <p className="text-[#253557]/70 mb-4">{description}</p>
        )}
        <ul className="space-y-2">
          {content.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CircleCheck className="h-5 w-5 text-[#0BD255] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[#253557]/80">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
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
      className="bg-white/90 backdrop-blur-sm border border-primary/10 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        <ul className="space-y-2 text-gray-600">
          {content.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CircleCheck className="h-5 w-5 text-primary/60 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
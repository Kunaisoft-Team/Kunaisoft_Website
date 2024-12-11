import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin } from "lucide-react";
import { shareOnTwitter, shareOnLinkedIn } from "@/utils/sharing";

interface BlogHeaderProps {
  title: string;
  excerpt?: string;
  createdAt: string;
  readingTimeMinutes: number;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
}

export const BlogHeader = ({
  title,
  excerpt,
  createdAt,
  readingTimeMinutes,
  author,
}: BlogHeaderProps) => {
  const currentUrl = window.location.href;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
        <Calendar className="w-4 h-4" />
        <time dateTime={createdAt}>{formatDate(createdAt)}</time>
        <span>•</span>
        <Clock className="w-4 h-4" />
        <span>{readingTimeMinutes} min read</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#1A1F2C] leading-tight">
        {title}
      </h1>

      {excerpt && (
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          {excerpt}
        </p>
      )}

      <div className="flex items-center justify-center gap-4 mb-8">
        <img
          src={
            author.avatarUrl ||
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
          }
          alt={author.fullName}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
        />
        <div className="text-left">
          <p className="font-semibold text-[#1A1F2C]">{author.fullName}</p>
          <p className="text-sm text-gray-600">Content Strategist at Kunaisoft</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => shareOnTwitter(title, currentUrl)}
        >
          <Twitter className="w-4 h-4" />
          Share on Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => shareOnLinkedIn(title, currentUrl)}
        >
          <Linkedin className="w-4 h-4" />
          Share on LinkedIn
        </Button>
      </div>
    </header>
  );
};
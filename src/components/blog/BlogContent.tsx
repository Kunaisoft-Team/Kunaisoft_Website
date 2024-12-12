import { cn } from "@/lib/utils";
import { KeyTakeaways } from "./KeyTakeaways";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin } from "lucide-react";
import { shareOnTwitter, shareOnLinkedIn } from "@/utils/sharing";

interface BlogContentProps {
  content: string;
  imageUrl?: string;
  title: string;
  takeaways: string[];
}

export const BlogContent = ({ content, imageUrl, title, takeaways }: BlogContentProps) => {
  const currentUrl = window.location.href;

  return (
    <div className="bg-white w-full py-16">
      <div className="max-w-[800px] mx-auto px-4">
        {imageUrl && (
          <figure className="mb-16 animate-fade-in">
            <img
              src={imageUrl}
              alt={title}
              className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </figure>
        )}

        <div
          className={cn(
            "prose prose-lg max-w-none",
            "prose-headings:text-[#1A1F2C] prose-headings:font-bold",
            "prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6",
            "prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4",
            "prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6",
            "prose-a:text-primary hover:prose-a:text-primary/80",
            "prose-strong:text-[#1A1F2C] prose-strong:font-semibold",
            "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
            "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6",
            "prose-li:text-gray-600 prose-li:mb-2",
            "prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary",
            "prose-blockquote:pl-6 prose-blockquote:italic",
            "prose-blockquote:text-gray-600 prose-blockquote:my-8",
            "animate-fade-in"
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <KeyTakeaways takeaways={takeaways} />

        <div className="mt-16 pt-8 border-t border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-[#1A1F2C] mb-4">
            Share this article
          </h3>
          <div className="flex gap-3">
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
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function RSSFeedTester() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testCases = [
    {
      name: "Basic Article",
      data: {
        title: "Test Article 1",
        content: "This is a basic test article content.",
        category: "ai_tools"
      }
    },
    {
      name: "Long Content Article",
      data: {
        title: "Test Article with Long Content",
        content: "Lorem ipsum ".repeat(100), // Creates a long content string
        category: "productivity"
      }
    },
    {
      name: "Special Characters",
      data: {
        title: "Test & Article © with ñ Special Chars",
        content: "Content with © special & characters ñ",
        category: "ai_prompts"
      }
    },
    {
      name: "HTML Content",
      data: {
        title: "Article with HTML",
        content: "<p>This is a <strong>formatted</strong> article with <a href='#'>links</a></p>",
        category: "getting_things_done"
      }
    },
    {
      name: "Null Values Test",
      data: {
        title: null,
        content: undefined,
        category: "ai_tools",
        metadata: null,
        tags: [null, undefined, "valid-tag"]
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rss-articles', {
        body: { testData: testCase.data }
      });

      if (error) throw error;

      toast({
        title: `Test "${testCase.name}" completed`,
        description: `Successfully processed: ${data.message}`,
      });

      console.log(`Test "${testCase.name}" result:`, data);
    } catch (error) {
      console.error(`Test "${testCase.name}" failed:`, error);
      toast({
        title: "Test failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold">RSS Feed Tester</h2>
      <div className="space-y-2">
        {testCases.map((testCase) => (
          <div key={testCase.name} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
            <span className="font-medium">{testCase.name}</span>
            <Button 
              onClick={() => runTest(testCase)} 
              disabled={isLoading}
              variant="outline"
            >
              Run Test
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-white/80">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 bg-primary/5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-primary/5" />
              <Skeleton className="h-4 w-5/6 bg-primary/5" />
              <Skeleton className="h-4 w-4/6 bg-primary/5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
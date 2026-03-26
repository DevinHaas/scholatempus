import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

export function ClassDataSetupSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Logo */}
        <Skeleton className="h-7 w-32" />

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 3 && <Skeleton className="h-px w-12 mx-2" />}
            </div>
          ))}
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
              <Skeleton className="h-11 w-full" />
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-3 w-72 mx-auto" />
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export function MembersSkeleton() {
  return (
    <div className="space-y-12 pb-12 w-full animate-in fade-in duration-500">
      {Array.from({ length: 3 }).map((_, genIdx) => (
        <section key={genIdx} className="relative">
          {/* Connector line between generations */}
          {genIdx > 0 && (
            <div className="absolute left-8 -top-8 w-px h-10 bg-border/50" aria-hidden="true" />
          )}

          {/* Generation Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 mr-2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md hidden sm:block" />
                <Skeleton className="h-8 w-24 rounded-md hidden md:block" />
              </div>
            </div>
          </div>

          {/* Members Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: genIdx === 0 ? 2 : genIdx === 1 ? 4 : 5 }).map((_, memberIdx) => (
              <div key={memberIdx} className="rounded-xl border bg-card p-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-16">
      
      {/* 1. FAMILY INTRO / HERO SKELETON */}
      <section className="flex flex-col items-center md:items-start text-center md:text-left pt-8 pb-4">
        <Skeleton className="h-12 w-64 md:w-96 mb-4 rounded-xl" />
        <Skeleton className="h-6 w-full max-w-2xl mb-2 rounded-lg" />
        <Skeleton className="h-6 w-3/4 max-w-xl mb-8 rounded-lg" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </section>

      {/* 2. FAMILY SNAPSHOT SKELETON */}
      <section className="bg-secondary/20 rounded-3xl p-8 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex gap-12 md:gap-24 flex-wrap">
          <div className="flex flex-col gap-2">
             <Skeleton className="h-10 w-16 rounded-lg" />
             <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
             <Skeleton className="h-10 w-16 rounded-lg" />
             <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
             <Skeleton className="h-10 w-16 rounded-lg" />
             <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>
        <div className="w-full max-w-xs md:text-right border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
           <Skeleton className="h-4 w-full mb-2 rounded-md" />
           <Skeleton className="h-4 w-3/4 md:ml-auto rounded-md" />
        </div>
      </section>

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-16">
          
          <section>
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="space-y-6">
               <Skeleton className="w-full aspect-video rounded-3xl" />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <Skeleton className="h-32 rounded-2xl" />
                 <Skeleton className="h-32 rounded-2xl" />
               </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
            <Skeleton className="w-full h-64 rounded-3xl" />
          </section>

        </div>

        {/* Side Column */}
        <div className="lg:col-span-4 space-y-12">
          
          <section>
            <Skeleton className="h-6 w-32 mb-4 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <Skeleton key={i} className="w-12 h-12 rounded-full" />
              ))}
            </div>
          </section>

          <section className="bg-card rounded-3xl p-6 border border-border">
            <Skeleton className="h-6 w-40 mb-6 rounded-lg" />
            <div className="space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                     <Skeleton className="h-4 w-24 rounded-md" />
                     <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-3xl p-6 border border-border">
            <Skeleton className="h-6 w-40 mb-6 rounded-lg" />
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-3 h-3 rounded-full mt-1 shrink-0" />
                  <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-full rounded-md" />
                     <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

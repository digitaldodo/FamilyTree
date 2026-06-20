import { Skeleton } from '@/components/ui/skeleton';

export function TreeSkeleton() {
  return (
    <div className="w-full h-[600px] bg-background/50 flex flex-col items-center justify-center p-8 border rounded-xl overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-4xl">
        {/* Top Node */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-48 h-20 rounded-lg shadow-sm" />
        </div>

        {/* Lines and Second Row */}
        <div className="relative w-full flex justify-center gap-16">
          <div className="absolute top-[-24px] left-1/2 w-px h-6 bg-border/50 -translate-x-1/2" />
          <div className="absolute top-[-24px] left-[25%] right-[25%] h-px bg-border/50" />
          <div className="absolute top-[-24px] left-[25%] w-px h-6 bg-border/50" />
          <div className="absolute top-[-24px] right-[25%] w-px h-6 bg-border/50" />
          
          <Skeleton className="w-48 h-20 rounded-lg shadow-sm" />
          <Skeleton className="w-48 h-20 rounded-lg shadow-sm" />
        </div>

        {/* Lines and Third Row */}
        <div className="relative w-full flex justify-between px-8">
          {/* Left Branch */}
          <div className="absolute top-[-24px] left-[20%] w-px h-6 bg-border/50" />
          <div className="absolute top-[-24px] left-[10%] right-[30%] h-px bg-border/50" />
          <div className="absolute top-[-24px] left-[10%] w-px h-6 bg-border/50" />
          <div className="absolute top-[-24px] left-[30%] w-px h-6 bg-border/50" />
          
          {/* Right Branch */}
          <div className="absolute top-[-24px] right-[20%] w-px h-6 bg-border/50" />
          <div className="absolute top-[-24px] right-[10%] left-[70%] h-px bg-border/50" />
          <div className="absolute top-[-24px] right-[10%] w-px h-6 bg-border/50" />
          <div className="absolute top-[-24px] right-[30%] w-px h-6 bg-border/50" />

          <Skeleton className="w-40 h-20 rounded-lg shadow-sm" />
          <Skeleton className="w-40 h-20 rounded-lg shadow-sm" />
          <Skeleton className="w-40 h-20 rounded-lg shadow-sm" />
          <Skeleton className="w-40 h-20 rounded-lg shadow-sm" />
        </div>
      </div>
      
      <div className="absolute bottom-8 flex gap-2">
         <Skeleton className="w-32 h-10 rounded-full" />
      </div>
    </div>
  );
}

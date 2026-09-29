import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary/60 mb-4" />
      <div className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase">
        Loading FamilyTree...
      </div>
    </div>
  );
}

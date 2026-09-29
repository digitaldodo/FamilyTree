import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center shadow-sm mb-6">
        <FileQuestion className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-foreground mb-3 text-center">Page Not Found</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      
      <Link href="/dashboard">
        <Button className="rounded-full shadow-sm" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

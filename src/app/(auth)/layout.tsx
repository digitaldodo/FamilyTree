import { ReactNode } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative bg-muted/30 border-r border-border items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        
        <div className="relative z-10 p-12 max-w-lg text-center backdrop-blur-sm bg-background/30 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/25">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
            Preserve Your Legacy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join thousands of families building their interactive family trees. Share memories, discover connections, and preserve your history forever.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <Link href="/" className="md:hidden flex items-center gap-2 font-bold text-xl mb-12">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">F</div>
          FamilyTree
        </Link>
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

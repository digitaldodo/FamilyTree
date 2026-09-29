import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-background via-muted/30 to-muted items-center justify-center overflow-hidden p-12 lg:p-24 border-r border-border">
        {/* Subtle branching line pattern / watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="branch-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 100 V70 M50 70 Q50 50 20 50 M50 70 Q50 50 80 50 M20 50 V20 M80 50 V20" stroke="currentColor" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#branch-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-lg w-full">
          <Link href="/" className="inline-block mb-12">
            <Image
              src="/logo.png"
              alt="FamilyTree"
              width={160}
              height={107}
              className="w-32 md:w-40 h-auto drop-shadow-sm"
              priority
            />
          </Link>
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              Every family has a story.
              <br />
              <span className="text-primary italic font-serif font-medium mt-2 block">Start yours today.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Bring generations together, preserve precious memories, and discover the connections that make your family unique.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-card safe-area-top safe-area-bottom relative">
        <Link href="/" className="md:hidden flex items-center gap-2 mb-12">
          <Image
            src="/logo.png"
            alt="FamilyTree"
            width={120}
            height={80}
            className="w-28 h-auto"
            priority
          />
        </Link>
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

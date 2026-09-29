import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative bg-secondary border-r border-border items-end justify-start overflow-hidden p-12 lg:p-24">
        {/* Full background image, authentic and warm */}
        <Image 
          src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1600"
          alt="Family memories"
          fill
          className="object-cover opacity-80 mix-blend-multiply filter grayscale-[0.3]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        <div className="relative z-10 max-w-lg">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="FamilyTree"
              width={160}
              height={107}
              className="w-32 md:w-40 h-auto mb-8 bg-background/50 backdrop-blur-md rounded-lg p-2"
              priority
            />
          </Link>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-foreground leading-[1.2]">
            Every family has a story. <br className="hidden lg:block" />
            <span className="text-muted-foreground italic font-serif">Start yours today.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join thousands of families building their interactive family trees. Share memories, discover connections, and preserve your history forever.
          </p>
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

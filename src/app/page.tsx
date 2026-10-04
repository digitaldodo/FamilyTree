import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Shield, Image as ImageIcon, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="FamilyLegacy home" className="flex items-center gap-2">
            <Image src="/logo.png" alt="FamilyLegacy" width={32} height={32} className="w-8 h-8 object-contain rounded-md" />
            <span className="font-semibold text-lg tracking-tight">FamilyLegacy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Preserve your family history
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-foreground">
            Every family has a story. <br className="hidden sm:block" />
            <span className="text-primary">Keep it in the family.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Connect generations, preserve photographs and memories, and hold on to the stories of the people who made you who you are.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-12 px-8">
              Start your family tree
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-8">
              Sign into existing tree
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-card border-y border-border/50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">More than names and dates</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Family history is not something you find. It is something you keep.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">See the shape of your family</h3>
                <p className="text-muted-foreground">Bring grandparents, parents, partners and children into one living picture. Follow connections across generations.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Keep the moments behind the names</h3>
                <p className="text-muted-foreground">Add photographs, stories and milestones directly to the people and moments they belong to.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Share the story, on your terms</h3>
                <p className="text-muted-foreground">Keep your tree private, decide who can view it, and choose who can help add the next memory.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Don&apos;t let your family&apos;s stories disappear.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start preserving the people, places and moments that matter—before they fade.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 h-14 px-8">
              Create your family tree
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Image src="/logo.png" alt="FamilyLegacy" width={24} height={24} className="rounded-md" />
            <span className="font-semibold text-sm">FamilyLegacy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FamilyLegacy. Made for the stories that stay with us.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

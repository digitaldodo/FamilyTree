import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GitMerge, Heart, Shield, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Navbar Minimal */}
      <header className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="font-bold text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">F</div>
          FamilyTree
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
          {/* Animated background gradient blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Preserve Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Family Legacy
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create beautiful interactive family trees with memories, relationships, and generations connected forever. Share your history with the ones you love.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8">
                Start Building Free
              </Button>
            </Link>
            <Link href="#preview">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8">
                View Live Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-muted/30 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to map your heritage</h2>
              <p className="text-muted-foreground">Powerful features wrapped in an elegant, easy-to-use interface.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: GitMerge, title: "Interactive Trees", desc: "Drag, drop, pan, and zoom through generations seamlessly." },
                { icon: Users, title: "Rich Profiles", desc: "Store bios, photos, and life events for every member." },
                { icon: Shield, title: "Private & Secure", desc: "Your family data is encrypted and completely under your control." },
                { icon: Heart, title: "Easy Sharing", desc: "Invite relatives to view or collaborate on your tree." },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} FamilyTree SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GitMerge, Heart, Shield, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Navbar Minimal */}
      <header className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between safe-area-top">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-bold text-xl flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">F</div>
          Family Legacy
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <Link href="/dashboard">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </motion.div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 px-6 max-w-7xl mx-auto text-center">
          {/* Animated background gradient blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none -z-10 animate-pulse" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8"
          >
            Preserve Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Family Legacy
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
          >
            Create beautiful interactive family trees with memories, relationships, and generations connected forever. Share your history with the ones you love.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base h-14 px-8">
                Start Building Free
              </Button>
            </Link>
            <Link href="#preview" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base h-14 px-8">
                View Live Demo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 px-6 bg-muted/30 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Everything you need to map your heritage</h2>
              <p className="text-muted-foreground">Powerful features wrapped in an elegant, easy-to-use interface.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: GitMerge, title: "Interactive Trees", desc: "Drag, drop, pan, and zoom through generations seamlessly." },
                { icon: Users, title: "Rich Profiles", desc: "Store bios, photos, and life events for every member." },
                { icon: Shield, title: "Private & Secure", desc: "Your family data is encrypted and completely under your control." },
                { icon: Heart, title: "Easy Sharing", desc: "Invite relatives to view or collaborate on your tree." },
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-border text-center text-muted-foreground text-sm safe-area-bottom">
        <p>© {new Date().getFullYear()} Family Legacy. All rights reserved.</p>
      </footer>
    </div>
  );
}

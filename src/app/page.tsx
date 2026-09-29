'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  GitMerge, 
  Users,
  Image as ImageIcon,
  Calendar,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Navbar Minimal */}
      <header className="absolute top-0 w-full h-24 z-50 flex items-center justify-between px-6 md:px-12 lg:px-24 safe-area-top">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="FamilyTree"
            width={140}
            height={90}
            className="w-28 md:w-36 h-auto"
            priority
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 md:gap-6 items-center"
        >
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6">Start Your Story</Button>
          </Link>
        </motion.div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-36 md:pt-48 pb-20 md:pb-32 px-6 lg:px-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <span className="text-sm uppercase tracking-[0.2em] font-medium text-muted-foreground mb-6">
              A Premium Family Heritage Platform
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-foreground leading-[1.1] mb-8">
              Preserve your family <br className="hidden md:block" />
              <span className="text-muted-foreground italic font-serif">history & stories.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              FamilyTree provides a single, beautiful place to connect generations, save precious photographs, and document the relationships that define who you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 rounded-full text-base shadow-sm">
                  Build Your Family Tree
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full h-14 px-8 rounded-full text-base">
                  View Existing Tree
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Abstract / UI Representation of the Tree */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl mx-auto mt-20 relative h-[400px] md:h-[600px] bg-secondary/30 rounded-3xl md:rounded-[2.5rem] border border-border/50 overflow-hidden flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-background/0" />
            
            {/* Simulated UI Nodes */}
            <div className="relative w-full h-full">
              {/* Grandparents Layer */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex gap-16 md:gap-32">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                    <Users className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                    <Users className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
                  </div>
                </div>
              </div>
              
              {/* Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-border stroke-[2px] fill-none" preserveAspectRatio="none">
                <path d="M 50% 25% L 50% 45%" />
                <path d="M 35% 45% L 65% 45%" />
                <path d="M 35% 45% L 35% 55%" />
                <path d="M 65% 45% L 65% 55%" />
              </svg>

              {/* Parents Layer */}
              <div className="absolute top-[55%] left-[35%] -translate-x-1/2 flex items-center justify-center">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-2 border-primary shadow-md flex items-center justify-center">
                   <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                 </div>
              </div>

              <div className="absolute top-[55%] left-[65%] -translate-x-1/2 flex gap-4 items-center justify-center">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                   <Users className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
                 </div>
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                   <Users className="w-6 h-6 md:w-8 md:h-8 opacity-20" />
                 </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Why Family History Matters */}
        <section className="py-24 md:py-32 px-6 lg:px-24 bg-card border-y border-border">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Because every family has a story to tell.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that understanding where you come from grounds you in who you are. FamilyTree isn&apos;t just software—it&apos;s a digital heirloom designed to preserve the essence of your lineage for the generations that follow.
              </p>
              <ul className="space-y-4">
                {[
                  "Trace connections across generations",
                  "Preserve fragile historical memories",
                  "Document vital family milestones",
                  "Create a lasting legacy for your children"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-secondary">
              <Image 
                src="https://images.unsplash.com/photo-1581955743431-7788be4f16b6?auto=format&fit=crop&q=80&w=1000"
                alt="Vintage family portrait"
                fill
                className="object-cover opacity-90 sepia-[.2]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Feature Narrative */}
        <section className="py-24 md:py-32 px-6 lg:px-24">
          <div className="max-w-6xl mx-auto space-y-32">
            
            {/* The Tree */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
              <div className="order-2 md:order-1 relative aspect-square bg-muted rounded-[2rem] p-8 border border-border shadow-sm flex items-center justify-center">
                {/* Abstract UI Representation */}
                <div className="w-full h-full bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col">
                  <div className="w-full flex justify-between items-center mb-8 border-b border-border pb-4">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-border" />
                       <div className="w-3 h-3 rounded-full bg-border" />
                    </div>
                    <div className="w-24 h-4 bg-muted rounded-full" />
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-x-0 top-1/4 h-px bg-border" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                    <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-16 h-20 bg-secondary rounded-xl border border-border" />
                    <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-16 h-20 bg-secondary rounded-xl border border-border" />
                    <div className="absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-16 h-20 bg-primary/20 rounded-xl border border-primary/40" />
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <GitMerge className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold">The Tree</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Map your lineage with our intuitive interface. Connect parents, children, and spouses, visually structuring generations of history in a format that feels natural and expansive.
                </p>
              </div>
            </div>

            {/* Memories */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <ImageIcon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold">The Memories</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  More than just names and dates. Upload historical photographs, digitize letters, and link rich stories directly to the family members they belong to.
                </p>
              </div>
              <div className="relative aspect-square bg-muted rounded-[2rem] p-8 border border-border shadow-sm flex items-center justify-center">
                <div className="w-full h-full relative grid grid-cols-2 grid-rows-2 gap-4">
                   <div className="bg-card rounded-xl border border-border shadow-sm p-3">
                     <div className="w-full h-full bg-secondary rounded-lg" />
                   </div>
                   <div className="bg-card rounded-xl border border-border shadow-sm p-3 flex flex-col gap-3">
                     <div className="w-full h-1/2 bg-secondary rounded-lg" />
                     <div className="w-full h-4 bg-muted rounded" />
                     <div className="w-2/3 h-4 bg-muted rounded" />
                   </div>
                   <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col gap-4 justify-center items-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                   </div>
                   <div className="bg-card rounded-xl border border-border shadow-sm p-3">
                     <div className="w-full h-full bg-accent/20 rounded-lg border border-accent/30" />
                   </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
              <div className="order-2 md:order-1 relative aspect-square bg-muted rounded-[2rem] p-8 border border-border shadow-sm flex items-center justify-center">
                <div className="w-full max-w-sm flex flex-col gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-accent' : 'bg-primary'}`} />
                        {i !== 3 && <div className="w-px h-full bg-border my-2" />}
                      </div>
                      <div className="bg-card flex-1 rounded-xl p-4 border border-border shadow-sm pb-8">
                        <div className="w-16 h-3 bg-muted rounded mb-3" />
                        <div className="w-3/4 h-4 bg-secondary rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <Calendar className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold">The Timeline</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  View your family&apos;s history chronologically. Watch as historical events shape your ancestors&apos; lives, bringing context and depth to names in the tree.
                </p>
              </div>
            </div>
            
            {/* Collaboration */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                  <Share2 className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold">Collaborate & Share</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Family history is a collective effort. Invite relatives to view, contribute, and help map out branches of the family you might not know.
                </p>
              </div>
              <div className="relative aspect-square bg-muted rounded-[2rem] p-8 border border-border shadow-sm flex items-center justify-center">
                 <div className="w-full h-full bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
                   <div className="text-sm font-medium mb-4 text-foreground">Invite Family</div>
                   <div className="flex gap-2 mb-6">
                     <div className="flex-1 h-10 bg-secondary rounded-lg border border-border" />
                     <div className="w-20 h-10 bg-primary rounded-lg" />
                   </div>
                   <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-secondary border border-border" />
                           <div className="w-24 h-4 bg-secondary rounded" />
                         </div>
                         <div className="w-16 h-4 bg-muted rounded" />
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 px-6 bg-card border-t border-border text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Begin your family story.</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Join families worldwide in preserving their most valuable asset: their history.
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 rounded-full text-base shadow-sm">
                  Preserve Your History
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border pt-16 pb-8 px-6 lg:px-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <Image
              src="/logo.png"
              alt="FamilyTree"
              width={140}
              height={90}
              className="w-24 md:w-32 h-auto mb-4"
            />
            <p className="text-muted-foreground max-w-xs text-sm">
              Helping families preserve generations, relationships, stories, and memories in one place.
            </p>
          </div>
          <div className="flex gap-12">
             <div className="flex flex-col gap-3">
               <span className="font-semibold text-sm">Product</span>
               <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
               <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Register</Link>
             </div>
             <div className="flex flex-col gap-3">
               <span className="font-semibold text-sm">Legal</span>
               <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Privacy</span>
               <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Terms</span>
             </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-border/50 text-sm text-muted-foreground text-center md:text-left flex flex-col md:flex-row justify-between safe-area-bottom">
          <p>© {new Date().getFullYear()} FamilyTree. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

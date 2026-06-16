'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GitMerge, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Tree', href: '/tree', icon: GitMerge },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Timeline', href: '/dashboard/timeline', icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-xl border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="flex-1 h-full">
              <div className="flex flex-col items-center justify-center h-full w-full gap-1 group relative pb-1">
                <div
                  className={cn(
                    'flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 relative',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {/* Active Indicator Background */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('h-5 w-5 relative z-10', isActive && 'scale-110 transition-transform')} />
                </div>
                <span 
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

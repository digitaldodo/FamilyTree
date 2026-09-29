'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GitMerge, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Tree', href: '/tree', icon: GitMerge },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Timeline', href: '/dashboard/timeline', icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t border-border z-30 safe-area-bottom select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 h-full min-w-0 flex items-center justify-center"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-full py-1.5 transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0 transition-transform', isActive && 'stroke-[2.25]')} />
                <span
                  className={cn(
                    'text-[10px] tracking-tight leading-none truncate max-w-[64px]',
                    isActive ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  ChevronLeft,
  ChevronRight,
  History,
  ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { TreeSelector } from '../features/tree/tree-selector';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Family Tree', href: '/tree', icon: GitMerge },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Timeline', href: '/dashboard/timeline', icon: History },
  { name: 'Greetings', href: '/greetings', icon: ImageIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const openCreateTreeModal = () => {
    window.dispatchEvent(new Event('open-create-tree-modal'));
  };

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col relative shrink-0 z-20 transition-all duration-200 ease-in-out select-none',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Top Header: Family Identity & Switcher */}
      <div className="h-14 px-3 flex items-center border-b border-border shrink-0">
        <div className="w-full">
          <TreeSelector onCreateTree={openCreateTreeModal} collapsed={!sidebarOpen} />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
        <div className="px-2 pb-1.5">
          {sidebarOpen && (
            <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Navigation
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} title={!sidebarOpen ? item.name : undefined}>
              <div
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer group',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                {sidebarOpen && (
                  <span className="truncate tracking-tight">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer: Collapse Toggle & Subtle Controls */}
      <div className="p-2 border-t border-border mt-auto shrink-0 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-xs',
            sidebarOpen ? 'w-full gap-2 px-2' : 'w-full'
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-normal">Collapse sidebar</span>
            </>
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}

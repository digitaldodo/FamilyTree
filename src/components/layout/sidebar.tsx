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
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { TreeSelector } from '../features/tree/tree-selector';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Timeline', href: '/dashboard/timeline', icon: History },
  { name: 'Family Tree', href: '/tree', icon: GitMerge },
  { name: 'Members', href: '/members', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const openCreateTreeModal = () => {
    window.dispatchEvent(new Event('open-create-tree-modal'));
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 220 : 64 }}
        className="h-screen bg-background border-r border-border flex flex-col relative shrink-0 z-20"
      >
        {/* Logo */}
        <div className="h-14 px-4 flex items-center border-b border-border">
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-sm flex items-center gap-2 tracking-tight"
            >
              FamilyTree
            </motion.div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-md bg-foreground text-background flex items-center justify-center text-xs font-bold">
              F
            </div>
          )}
        </div>

        {/* Tree Selector */}
        {sidebarOpen && (
          <div className="px-3 pt-3">
            <TreeSelector onCreateTree={openCreateTreeModal} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative group',
                    isActive
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}

                  {/* Tooltip for closed state */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none shadow-md border border-border whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-8 rounded-md"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}

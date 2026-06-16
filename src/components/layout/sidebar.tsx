'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GitMerge, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { TreeSelector } from '../features/tree/tree-selector';
import { CreateTreeModal } from '../features/tree/create-tree-modal';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Timeline', href: '/dashboard/timeline', icon: History },
  { name: 'Family Tree', href: '/tree', icon: GitMerge },
  { name: 'Members', href: '/members', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-tree-modal', handleOpenModal as EventListener);
    return () => window.removeEventListener('open-create-tree-modal', handleOpenModal as EventListener);
  }, []);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="h-screen bg-card border-r border-border flex flex-col relative shrink-0 transition-all duration-300 z-20"
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-border">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                F
              </div>
              FamilyTree
            </motion.div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              F
            </div>
          )}
        </div>

        <div className="pt-4 px-2">
          {sidebarOpen && <TreeSelector onCreateTree={() => setIsCreateModalOpen(true)} />}
        </div>

        <div className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : '')} />
                  {sidebarOpen && (
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                  
                  {/* Tooltip for closed state */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none shadow-md whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-border mt-auto">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-10"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </motion.aside>

      <CreateTreeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}

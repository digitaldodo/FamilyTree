import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TreeInitializer } from '@/components/providers/tree-initializer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TreeInitializer />
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-20 md:pb-6 relative">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

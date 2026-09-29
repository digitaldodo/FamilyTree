import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TreeInitializer } from '@/components/providers/tree-initializer';
import { CreateTreeModalHost } from '@/components/providers/create-tree-modal-host';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <TreeInitializer />
      <CreateTreeModalHost />
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="relative flex-1 overflow-y-auto custom-scrollbar p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

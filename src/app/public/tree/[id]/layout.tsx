import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shared Family Tree — Family Legacy',
  description: 'View a shared family tree on Family Legacy.',
};

export default function PublicTreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

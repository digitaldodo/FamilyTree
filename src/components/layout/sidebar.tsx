'use client';

// Dashboard Sidebar Component
// TODO: Implement collapsible sidebar
// TODO: Add icon + text nav items
// TODO: Add active state indicators
// TODO: Add user profile section at bottom

import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Family Tree', href: '/tree', icon: '🌳' },
  { label: 'Members', href: '/members', icon: '👥' },
  { label: 'Admin', href: '/admin', icon: '⚙️' },
];

export default function Sidebar() {
  // TODO: Implement collapse/expand logic
  // TODO: Highlight active route
  return (
    <aside>
      {/* TODO: Logo */}
      <nav>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* TODO: User profile section */}
    </aside>
  );
}

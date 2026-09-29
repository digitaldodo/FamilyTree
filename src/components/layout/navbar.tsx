'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from '@/components/features/notifications/notification-dropdown';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const avatarUrl =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(session?.user?.name, session?.user?.email)}`;

  const renderProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-8 w-8 rounded-full overflow-hidden border border-border hover:border-foreground/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
          aria-label="Account menu"
        >
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
            unoptimized
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-foreground truncate">
            {session?.user?.name || 'Family Member'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {session?.user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="w-full flex items-center gap-2 cursor-pointer text-xs"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="w-full flex items-center gap-2 cursor-pointer text-xs"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 text-destructive cursor-pointer text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-b border-border bg-background sticky top-0 z-30 h-14 shrink-0 select-none">
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        {/* Brand & Identity (Visible on both mobile and desktop) */}
        <div className="flex items-center shrink-0">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="FamilyTree"
              width={100}
              height={32}
              className="h-7 w-auto object-contain transition-all"
              priority
            />
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search family members..."
              className="w-full h-8 pl-8 pr-12 rounded-md bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground/70 focus:bg-background focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Global Controls & Account Area */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Notification Menu */}
          <NotificationDropdown />

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>

          {/* Separator */}
          <div className="h-4 w-px bg-border mx-1" />

          {/* Profile Dropdown */}
          {renderProfileDropdown()}
        </div>
      </div>
    </header>
  );
}

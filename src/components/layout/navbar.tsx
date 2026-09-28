'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
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
          className="h-8 w-8 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-ring/20 transition-shadow cursor-pointer"
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
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {session?.user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="md:hidden">
            <button className="w-full flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                Notifications
              </div>
              <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="w-full flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="w-full flex items-center gap-2 cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10 h-14">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo - mobile only */}
        <div className="md:hidden flex items-center gap-2">
          <span className="font-semibold text-base">FamilyTree</span>
        </div>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full h-9 pl-9 pr-4 rounded-md bg-muted border border-transparent focus:bg-background focus:border-border focus:ring-1 focus:ring-ring outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-md"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex h-8 w-8 rounded-md relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
          </Button>

          {renderProfileDropdown()}
        </div>
      </div>
    </header>
  );
}

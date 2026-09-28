'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Search, Sun, Moon, Bell, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup } from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const avatarUrl = session?.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(session?.user?.name, session?.user?.email)}`;
  const renderProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[2px] cursor-pointer ml-2">
          <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            <Image src={avatarUrl} alt="User" width={32} height={32} className="h-full w-full object-cover" unoptimized />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 mb-1">
          <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="md:hidden">
            <button className="w-full flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                Notifications
              </div>
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4 text-muted-foreground" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full flex items-center gap-2 cursor-pointer">
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 sticky top-0 z-10 md:h-16 py-3 md:py-0 gap-3 md:gap-0">
      {/* Mobile Row 1: Logo & Profile */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            F
          </div>
          <span className="font-semibold text-lg">FamilyTree</span>
        </div>
        
        {/* Mobile Profile Actions */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {renderProfileDropdown()}
        </div>
      </div>

      {/* Row 2 on Mobile / Middle on Desktop: Search */}
      <div className="flex-1 w-full md:max-w-md order-3 md:order-none">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search family members..."
            className="w-full h-10 pl-9 pr-4 rounded-full bg-muted border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>

        {renderProfileDropdown()}
      </div>
    </header>
  );
}

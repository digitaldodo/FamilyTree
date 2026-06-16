'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Search, Sun, Moon, Bell, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const avatarUrl = session?.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(session?.user?.name, session?.user?.email)}`;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search family members..."
            className="w-full h-10 pl-9 pr-4 rounded-full bg-muted border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
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

        <div className="relative ml-2" ref={dropdownRef}>
          <div 
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[2px] cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <img src={avatarUrl} alt="User" className="h-full w-full object-cover" />
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-background border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <div className="py-1">
                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors">
                  <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

// Theme Provider
// Wraps next-themes for dark/light mode support
// TODO: Configure with system preference detection

import { ReactNode } from 'react';
// TODO: Uncomment when next-themes is installed
// import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // TODO: Replace with NextThemesProvider
  // return (
  //   <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
  //     {children}
  //   </NextThemesProvider>
  // );
  return <>{children}</>;
}

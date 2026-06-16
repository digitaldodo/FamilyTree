import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/toast';
import { SessionProvider } from '@/providers/session-provider';

// TODO: Import QueryProvider

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Family Legacy — Preserve generations beautifully.',
  description: 'Create beautiful interactive family trees with memories, relationships, and generations connected forever.',
  applicationName: 'Family Legacy',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Family Legacy',
  },
  openGraph: {
    title: 'Family Legacy',
    description: 'Preserve generations beautifully with interactive family trees.',
    url: 'https://familytree-saas.com',
    siteName: 'Family Legacy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Family Legacy Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Legacy',
    description: 'Preserve generations beautifully.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* TODO: Wrap with QueryProvider */}
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// TODO: Import ThemeProvider
// TODO: Import QueryProvider

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FamilyTree — Interactive Family Tree Builder',
  description: 'Build, visualize, and share your family history with an interactive family tree.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {/* TODO: Wrap with ThemeProvider */}
        {/* TODO: Wrap with QueryProvider */}
        {children}
      </body>
    </html>
  );
}

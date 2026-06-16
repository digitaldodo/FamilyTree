// Reusable Card Component
// TODO: Implement glassmorphism styles
// TODO: Add hover animation with Framer Motion
// TODO: Add gradient border variant

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
}

export default function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  // TODO: Apply glassmorphism and variant styles
  return (
    <div className={className}>
      {children}
    </div>
  );
}

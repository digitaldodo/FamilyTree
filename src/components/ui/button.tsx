// Reusable Button Component
// TODO: Implement variants (primary, secondary, ghost, danger)
// TODO: Implement sizes (sm, md, lg)
// TODO: Add loading state with spinner
// TODO: Add icon support

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ...props
}: ButtonProps) {
  // TODO: Apply variant and size styles
  return (
    <button {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

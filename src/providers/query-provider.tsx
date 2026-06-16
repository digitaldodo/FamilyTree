'use client';

// Query/Data Fetching Provider
// TODO: Implement with React Query / TanStack Query when added

import { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // TODO: Wrap with QueryClientProvider
  return <>{children}</>;
}

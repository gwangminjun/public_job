'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { I18nProvider } from './I18nProvider';
import { PwaRegister } from './PwaRegister';
import { LocalToDbMigration } from './LocalToDbMigration';
import { UserDataSync } from './UserDataSync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PwaRegister />
          <LocalToDbMigration />
          <UserDataSync />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

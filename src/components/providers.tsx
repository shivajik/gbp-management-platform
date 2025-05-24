'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component that wraps the entire application
 * with necessary context providers including theme, session, etc.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

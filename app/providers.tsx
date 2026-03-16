'use client';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { CertificationProvider } from './components/certification-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <SessionProvider>
      <CertificationProvider>
        <div style={mounted ? undefined : { visibility: 'hidden' }}>
          {children}
        </div>
      </CertificationProvider>
    </SessionProvider>
  );
}

'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Certification = 'CT-AI' | 'CT-GenAI';

interface CertificationContextType {
  certification: Certification;
  setCertification: (cert: Certification) => void;
  certLabel: string;
  certShortLabel: string;
}

const CertificationContext = createContext<CertificationContextType>({
  certification: 'CT-AI',
  setCertification: () => {},
  certLabel: 'CT-AI Testing',
  certShortLabel: 'CT-AI',
});

export function CertificationProvider({ children }: { children: ReactNode }) {
  const [certification, setCertificationState] = useState<Certification>('CT-AI');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCertification') : null;
    if (saved === 'CT-AI' || saved === 'CT-GenAI') {
      setCertificationState(saved);
    }
    setMounted(true);
  }, []);

  const setCertification = (cert: Certification) => {
    setCertificationState(cert);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCertification', cert);
    }
  };

  const certLabel = certification === 'CT-GenAI' ? 'CT-GenAI Testing with Generative AI' : 'CT-AI Testing';
  const certShortLabel = certification === 'CT-GenAI' ? 'CT-GenAI' : 'CT-AI';

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CertificationContext.Provider value={{ certification, setCertification, certLabel, certShortLabel }}>
      {children}
    </CertificationContext.Provider>
  );
}

export function useCertification() {
  return useContext(CertificationContext);
}

// Language Context — Hinglish / English Toggle

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  toggle: () => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('hi');

  const toggle = () => setLang(prev => (prev === 'hi' ? 'en' : 'hi'));

  const t = (en: string, hi: string) => (lang === 'hi' ? hi : en);

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const LanguageContextExport = LanguageContext;

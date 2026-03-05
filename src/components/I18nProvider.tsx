'use client';

import '@/i18n/client';
import { useEffect } from 'react';
import i18next from '@/i18n/client';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateLang = (lng: string) => {
      document.documentElement.lang = lng;
    };

    updateLang(i18next.resolvedLanguage || 'ko');
    i18next.on('languageChanged', updateLang);

    return () => {
      i18next.off('languageChanged', updateLang);
    };
  }, []);

  return <>{children}</>;
}

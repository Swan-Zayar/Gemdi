import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import all translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import my from '../locales/my.json';
import ms from '../locales/ms.json';

type Translations = typeof en;
type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'my' | 'ms';

const translations: Record<Language, Translations> = {
  en,
  es,
  fr,
  de,
  zh,
    ja,
    my,
    ms
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, defaultLanguage = 'en' }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Load saved language from localStorage if available
    const savedLanguage = localStorage.getItem('gemdi-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gemdi-language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key; // Return key itself if not found in any language
          }
        }
        return value;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    welcome: 'Welcome back',
    newDocument: 'New Document',
    archive: 'Archive',
    totalDocuments: 'Total Documents',
    physicalFiles: 'Physical Files',
    aiSearch: 'AI Search',
    darkMode: 'Dark Mode',
    language: 'العربية',
  },
  ar: {
    welcome: 'مرحبا بعودتك',
    newDocument: 'مستند جديد',
    archive: 'أرشيف',
    totalDocuments: 'إجمالي المستندات',
    physicalFiles: 'الملفات الفعلية',
    aiSearch: 'بحث ذكي',
    darkMode: 'الوضع المظلم',
    language: 'English',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
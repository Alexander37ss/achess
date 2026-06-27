import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importamos nuestros archivos de traducción (que crearemos en el siguiente paso)
import translationES from './locales/es/global.json';
import translationEN from './locales/en/global.json';

i18n
  .use(LanguageDetector) // Detecta automáticamente el idioma del navegador
  .use(initReactI18next)
  .init({
    resources: {
      es: { global: translationES },
      en: { global: translationEN }
    },
    lng: 'es', // Idioma por defecto
    fallbackLng: 'en', // Idioma de respaldo
    interpolation: { escapeValue: false }
  });

export default i18n;
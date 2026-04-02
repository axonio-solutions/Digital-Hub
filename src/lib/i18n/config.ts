import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const defaultNS = 'common'
export const fallbackLng = 'en'
export const languages = ['en', 'fr', 'ar']

export const resources = {
  en: {
    common: {
      welcome: 'Welcome to MLILA',
      search: 'Search for parts...',
      login: 'Login',
      signup: 'Sign Up',
      explore: 'Explore',
      howItWorks: 'How it Works',
      faq: 'FAQ',
    },
  },
  fr: {
    common: {
      welcome: 'Bienvenue sur MLILA',
      search: 'Rechercher des pièces...',
      login: 'Connexion',
      signup: "S'inscrire",
      explore: 'Explorer',
      howItWorks: 'Comment ça marche',
      faq: 'FAQ',
    },
  },
  ar: {
    common: {
      welcome: 'مرحبًا بك في مليلة',
      search: 'ابحث عن قطع الغيار...',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      explore: 'استكشاف',
      howItWorks: 'كيف يعمل',
      faq: 'الأسئلة الشائعة',
    },
  },
} as const

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'cookie', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
  })

export default i18n

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const defaultNS = 'common'
export const fallbackLng = 'en'
export const languages = ['en', 'fr', 'ar']

import enCommon from './locales/en.json'
import frCommon from './locales/fr.json'
import arCommon from './locales/ar.json'

export const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
  ar: { common: arCommon },
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

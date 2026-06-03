import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { storage } from '../lib/storage'

import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const LANG_KEY = 'app-language'

export async function initI18n(): Promise<string | null> {
  const saved = await storage.getItem(LANG_KEY)
  const lng = saved || 'en'

  await i18next.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    interpolation: { escapeValue: false },
    returnObjects: false,
    react: { useSuspense: false },
  })

  return saved
}

export async function changeLanguage(lng: string) {
  await storage.setItem(LANG_KEY, lng)
  await i18next.changeLanguage(lng)
}

export default i18next

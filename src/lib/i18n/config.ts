import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const defaultNS = 'common'
export const fallbackLng = 'en'
export const languages = ['en', 'fr', 'ar', 'ar-DZ']

// Dynamically load all JSON files in the locales folder
const modules = import.meta.glob('./locales/**/*.json', { eager: true })

export const resources: Record<string, Record<string, any>> = {
  en: {},
  fr: {},
  ar: {},
  'ar-DZ': {},
}

// Process the glob-imported modules into the resources object
Object.entries(modules).forEach(([path, module]) => {
  const parts = path.split('/')
  // Example path: ./locales/en.json or ./locales/en/home.json
  // parts: ['.', 'locales', 'en.json'] or ['.', 'locales', 'en', 'home.json']
  
  const langWithExt = parts[2]
  let lang: string
  let ns: string

  if (parts.length === 3 && langWithExt.endsWith('.json')) {
    // Top-level files like locales/en.json become the 'common' namespace
    lang = langWithExt.replace('.json', '')
    ns = 'common'
  } else {
    // Nested files like locales/en/dashboard/admin.json
    lang = langWithExt
    // Join the rest of the parts to form the namespace, e.g., 'dashboard/admin'
    ns = parts.slice(3).join('/').replace('.json', '')
  }

  if (resources[lang]) {
    resources[lang][ns] = (module as any).default || module
  }
})

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['cookie', 'localStorage'],
    },
  })

// Update document direction and language on change
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = (lng === 'ar' || lng === 'ar-DZ') ? 'rtl' : 'ltr'
    document.documentElement.lang = lng
  }
})

export default i18n

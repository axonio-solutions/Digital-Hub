import * as React from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n/config'

/**
 * Premium I18n Provider for MLILA
 * Handles RTL/LTR direction and language persistence
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Sync direction on mount and when language changes
    const syncDirection = (lng: string) => {
      document.documentElement.lang = lng
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    }

    syncDirection(i18n.language)
    i18n.on('languageChanged', syncDirection)
    
    return () => {
      i18n.off('languageChanged', syncDirection)
    }
  }, [])

  // During SSR or before hydration is stable, we just render
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}

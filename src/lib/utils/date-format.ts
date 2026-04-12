import { formatDistanceToNow } from 'date-fns'
import { enUS, fr, ar } from 'date-fns/locale'
import i18next from 'i18next'

const locales: Record<string, any> = {
  en: enUS,
  fr: fr,
  ar: ar,
}

/**
 * Formats a date relative to now, automatically detecting the current i18n language.
 * @param date The date to format
 * @param addSuffix Whether to add "ago" or "dans" suffixes
 */
export function formatRelativeTime(date: Date | string | number | null | undefined, addSuffix: boolean = true) {
  const currentLang = i18next.language || 'en'
  const locale = locales[currentLang] || enUS
  
  if (!date) return '---'

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date

  if (!dateObj || isNaN(dateObj.getTime())) {
    return '---'
  }

  return formatDistanceToNow(dateObj, { 
    addSuffix,
    locale 
  })
}

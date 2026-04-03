import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useLocalization } from '@/hooks/use-localization'
import { Languages, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ar-DZ', name: 'الدارجة', flag: '🇩🇿' },
]

/**
 * Premium Language Toggle Component
 * Allows users to switch between EN, FR, and AR with smooth transitions
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation('common')
  const { currentLanguage, changeLanguage, dir } = useLocalization()

  return (
    <DropdownMenu dir={dir}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("w-9 px-0 h-9 rounded-full theme-transition", className)}
          title={t('language_picker.title')}
        >
          <Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">{t('language_picker.title')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] theme-transition font-sans">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentLanguage === lang.code && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {currentLanguage === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

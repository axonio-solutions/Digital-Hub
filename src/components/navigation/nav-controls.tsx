import { ThemeSwitch } from '@/components/unlumen-ui/theme-switch'
import { LanguageToggle } from '@/components/language-toggle'

interface NavControlsProps {
  showLanguage?: boolean
  showTheme?: boolean
}

export function NavControls({
  showLanguage = true,
  showTheme = true,
}: NavControlsProps) {
  return (
    <>
      {showLanguage && <LanguageToggle />}
      {showTheme && <ThemeSwitch />}
    </>
  )
}

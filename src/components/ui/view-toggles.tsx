import { useTranslation } from 'react-i18next'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ViewTogglesProps {
  view: 'list' | 'grid'
  onViewChange: (view: 'list' | 'grid') => void
  className?: string
}

export function ViewToggles({
  view,
  onViewChange,
  className,
}: ViewTogglesProps) {
  const { t } = useTranslation('common')

  return (
    <div className={cn(
      "flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm",
      className
    )}>
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-3 text-xs gap-1.5 shadow-none font-bold rounded-lg"
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="size-3.5" />
        {t('view.grid')}
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-3 text-xs gap-1.5 shadow-none font-bold rounded-lg"
        onClick={() => onViewChange('list')}
      >
        <List className="size-3.5" />
        {t('view.list')}
      </Button>
    </div>
  )
}

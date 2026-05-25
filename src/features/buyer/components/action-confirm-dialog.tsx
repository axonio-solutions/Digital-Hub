'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Undo2,
  XCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'

type ActionVariant =
  | 'accept'
  | 'reject'
  | 'revoke'
  | 'unreject'
  | 'cancel'
  | 'reopen'
  | 'fulfill'
  | 'delete'
  | 'default'

interface ActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  actionVariant?: ActionVariant
  isLoading?: boolean
  loadingLabel?: string
  onConfirm: () => void
  children?: React.ReactNode
}

const actionConfig: Record<
  ActionVariant,
  {
    icon: React.ReactNode
    iconBg: string
    confirmVariant: 'default' | 'destructive' | 'outline'
    confirmClass: string
  }
> = {
  accept: {
    icon: <CheckCircle2 className="size-6" />,
    iconBg:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    confirmVariant: 'default',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  reject: {
    icon: <XCircle className="size-6" />,
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    confirmVariant: 'destructive',
    confirmClass: '',
  },
  revoke: {
    icon: <Undo2 className="size-6" />,
    iconBg:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
    confirmVariant: 'outline',
    confirmClass:
      'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950',
  },
  unreject: {
    icon: <RotateCcw className="size-6" />,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    confirmVariant: 'outline',
    confirmClass:
      'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950',
  },
  cancel: {
    icon: <XCircle className="size-6" />,
    iconBg:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
    confirmVariant: 'outline',
    confirmClass:
      'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950',
  },
  reopen: {
    icon: <RotateCcw className="size-6" />,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    confirmVariant: 'outline',
    confirmClass:
      'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950',
  },
  fulfill: {
    icon: <CheckCircle2 className="size-6" />,
    iconBg:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    confirmVariant: 'default',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  delete: {
    icon: <AlertTriangle className="size-6" />,
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    confirmVariant: 'destructive',
    confirmClass: '',
  },
  default: {
    icon: <AlertTriangle className="size-6" />,
    iconBg: 'bg-muted text-muted-foreground',
    confirmVariant: 'default',
    confirmClass: '',
  },
}

export function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  actionVariant = 'default',
  isLoading,
  loadingLabel,
  onConfirm,
  children,
}: ActionConfirmDialogProps) {
  const { t } = useTranslation('requests/list')
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    if (!open) setLocalLoading(false)
  }, [open])

  useEffect(() => {
    if (!isLoading) setLocalLoading(false)
  }, [isLoading])

  const loading = localLoading || isLoading
  const config = actionConfig[actionVariant]

  const handleConfirm = () => {
    setLocalLoading(true)
    onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) onOpenChange(v)
      }}
    >
      <DialogContent className="rounded-2xl max-w-sm gap-0 p-0">
        <div className="p-6 pb-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={`size-12 rounded-2xl flex items-center justify-center ${config.iconBg}`}
            >
              {config.icon}
            </div>
            <DialogHeader className="text-center gap-1.5">
              <h2 className="text-lg font-black text-foreground tracking-tight">
                {title}
              </h2>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {children && <div className="mt-4">{children}</div>}
        </div>

        <DialogFooter className="px-6 pb-6 gap-2 sm:justify-center flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-11 rounded-xl text-sm font-semibold flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={config.confirmVariant}
            className={`h-11 rounded-xl text-sm font-semibold flex-1 sm:flex-none sm:min-w-[120px] gap-2 ${config.confirmClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {loadingLabel || confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

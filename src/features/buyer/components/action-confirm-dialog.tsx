'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  confirmIcon?: React.ReactNode
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
  loadingLabel?: string
  onConfirm: () => void
}

export function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmIcon,
  cancelLabel,
  variant = 'default',
  isLoading,
  loadingLabel,
  onConfirm,
}: ActionConfirmDialogProps) {
  const { t } = useTranslation('requests/list')
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    if (!open) setLocalLoading(false)
  }, [open])

  const loading = localLoading || isLoading

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
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle
            className={variant === 'destructive' ? 'text-destructive' : ''}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 rounded-xl text-sm"
          >
            {cancelLabel || t('actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="h-10 rounded-xl text-sm gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {loadingLabel || confirmLabel}
              </>
            ) : (
              <>
                {confirmIcon}
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

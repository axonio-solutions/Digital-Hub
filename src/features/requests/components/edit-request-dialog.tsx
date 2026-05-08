'use client'

import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RequestWizard } from '@/features/requests/components/request-wizard-new'

interface EditRequestDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRequestDialog({
  request,
  open,
  onOpenChange,
}: EditRequestDialogProps) {
  const { t } = useTranslation('requests/form')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95dvh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('dialogs.edit_title')}</DialogTitle>
        </DialogHeader>
        <div className="h-[600px] max-h-[85dvh]">
          <RequestWizard
            initialData={request}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

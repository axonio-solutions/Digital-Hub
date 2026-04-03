import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/modal'
import { NewPartRequestForm } from '@/features/requests/components/new-request-form'

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
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('dialogs.edit_title')}
      description={t('dialogs.edit_description')}
      className="sm:max-w-[1000px] max-h-[90vh]"
      contentClassName="p-0 overflow-y-auto"
    >
      <div className="p-4 md:p-8">
        <NewPartRequestForm
          initialData={request}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </div>
    </Modal>
  )
}

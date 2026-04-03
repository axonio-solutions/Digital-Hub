'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SubmitQuoteForm } from './submit-quote-form'
import { useDeleteQuote } from '@/features/marketplace/hooks/use-marketplace'
import { toast } from 'sonner'

interface MarketplaceRowActionsProps {
  quote: any
}

export function MarketplaceRowActions({ quote }: MarketplaceRowActionsProps) {
  const { t } = useTranslation('marketplace')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const { mutate: deleteQuote, isPending: isDeleting } = useDeleteQuote()

  const handleRetract = () => {
    deleteQuote(quote.id, {
      onSuccess: () => {
        toast.success(t('toasts.retract_success'))
        setIsDeleteDialogOpen(false)
      },
      onError: () => {
        toast.error(t('toasts.retract_error'))
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <span className="sr-only">{t('table.row_actions.label')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1.5">
            {t('table.row_actions.label')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer px-3 py-2 font-medium"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 text-emerald-500 rtl:rotate-180" />
            {t('table.row_actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer px-3 py-2 font-medium text-rose-600 focus:text-rose-700 bg-rose-50/50 dark:bg-rose-950/20 mt-1"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            {t('table.row_actions.retract')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
          <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Pencil className="text-emerald-500 h-6 w-6 rtl:rotate-180" /> {t('table.row_actions.edit_title')}
            </DialogTitle>
            <p className="text-sm text-slate-500">{t('table.row_actions.edit_desc')}</p>
          </DialogHeader>
          <div className="p-8">
            <SubmitQuoteForm
              quoteId={quote.id}
              requestId={quote.requestId}
              sellerId={quote.sellerId}
              category={quote.request?.category?.name || quote.request?.category}
              vehicleInfo={{
                brand: quote.request?.vehicleBrand || t('defaults.unknown'),
                model: quote.request?.vehicleModel || t('defaults.unknown'),
                year: quote.request?.modelYear || t('defaults.unknown')
              }}
              initialData={{
                price: quote.price,
                condition: quote.condition,
                warranty: quote.warranty || '',
              }}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600">{t('table.row_actions.retract_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 mt-2">
            {t('table.row_actions.retract_confirm', { partName: quote.request?.partName })}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {t('close')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRetract}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 font-bold"
            >
              {isDeleting ? t('loading') : t('table.row_actions.retract_btn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

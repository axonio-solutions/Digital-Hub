'use client'

import { useState } from 'react'
import { 
  BadgeCheck, 
  Cpu, 
  FileText,
  Info,
  MapPin,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
  Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { RequestDetailsCompact } from './request-details-compact'
import { SubmitQuoteForm } from './submit-quote-form'
import { useDeleteQuote } from '@/features/marketplace/hooks/use-marketplace'
import { tCategory } from '@/utils/category-utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'


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
        <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[90vh] p-0 border-none sm:rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Left Panel: Technical Dossier */}
            <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900/40 p-8 lg:p-12 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col gap-8 text-left">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                      <Cpu className="w-3 h-3" /> Technical Dossier
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                      {quote.request?.partName}
                    </h1>
                  </div>
                  {quote.request?.urgency === 'asap' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <Zap className="w-3 h-3 fill-current" /> Priority
                    </div>
                  )}
                </div>

                {/* Main Image View */}
                <div className="relative group aspect-video rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
                  {quote.request?.imageUrls?.[0] ? (
                    <img 
                      src={quote.request.imageUrls[0]} 
                      alt={quote.request.partName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-300 dark:text-slate-800">
                      <Package className="w-16 h-16 stroke-[1]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Visual Signal Found</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                     <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Asset Inspection: EDIT MODE</span>
                     </div>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30">
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] flex items-center gap-1.5">
                      <BadgeCheck className="w-3 h-3" /> Vehicle Origin
                    </div>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase leading-none">
                      {quote.request?.vehicleBrand}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      Model Year: {quote.request?.modelYear}
                    </div>
                  </div>

                  <div className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30">
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Identification
                    </div>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase leading-none truncate">
                      {quote.request?.oemNumber || 'N/A'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      OEM SERIAL NUMBER
                    </div>
                  </div>

                  <div className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30">
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Terminal Location
                    </div>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase leading-none">
                      {quote.request?.location || 'Algeria'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      Buyer Terminal
                    </div>
                  </div>

                  <div className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30">
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] flex items-center gap-1.5">
                      <Info className="w-3 h-3" /> Classification
                    </div>
                    <div className="text-sm font-black text-primary uppercase leading-none">
                      {quote.request && tCategory(quote.request.category?.name || quote.request.category || quote.request.categoryId, t)}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      Category Tag
                    </div>
                  </div>
                </div>

                {quote.request?.description && (
                  <div className="p-6 rounded-[2rem] bg-slate-200/50 dark:bg-slate-800/20 border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Procurement Directives</div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic text-left">
                      "{quote.request.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Offer Submission Console */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto flex flex-col justify-center bg-white dark:bg-slate-950 text-left">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-10 lg:text-left">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 italic">
                    Edit Submission
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Modify your technical proposal for this procurement request.
                  </p>
                </div>

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
                  layout="default"
                  showContext={false}
                  onSuccess={() => setIsEditDialogOpen(false)}
                />
              </div>
            </div>
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

'use client'

import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  BadgeCheck, 
  Cpu, 
  FileText, 
  Info, 
  MapPin,
  Package,
  Zap
} from 'lucide-react'
import { SubmitQuoteForm } from './submit-quote-form'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { tCategory } from '@/utils/category-utils'

interface SendOfferDialogProps {
  request: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

export function SendOfferDialog({
  request,
  isOpen,
  onOpenChange,
  user,
}: SendOfferDialogProps) {
  const { t } = useTranslation('marketplace')

  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[90vh] p-0 border-none sm:rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Panel: Technical Dossier */}
          <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900/40 p-8 lg:p-12 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <Cpu className="w-3 h-3" /> Technical Dossier
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                    {request.partName}
                  </h1>
                </div>
                {request.urgency === 'asap' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Zap className="w-3 h-3 fill-current" /> Priority
                  </div>
                )}
              </div>

              {/* Main Image View */}
              <div className="relative group aspect-video rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
                {request.imageUrls?.[0] ? (
                  <img 
                    src={request.imageUrls[0]} 
                    alt={request.partName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-300 dark:text-slate-800">
                    <Package className="w-16 h-16 stroke-[1]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Visual Signal Found</span>
                  </div>
                )}
                {/* Image Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Asset Inspection: 01</span>
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
                    {request.vehicleBrand}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    Model Year: {request.modelYear}
                  </div>
                </div>

                <div className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30">
                  <div className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Identification
                  </div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase leading-none truncate">
                    {request.oemNumber || 'N/A'}
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
                    {request.location || 'Algeria'}
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
                    {tCategory(request.category?.name || request.category || request.categoryId, t)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    Category Tag
                  </div>
                </div>
              </div>

              {/* Note Section */}
              {request.description && (
                <div className="p-6 rounded-[2rem] bg-slate-200/50 dark:bg-slate-800/20 border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Procurement Directives</div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
                    "{request.description}"
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Panel: Offer Submission Console */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto flex flex-col justify-center bg-white dark:bg-slate-950">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 italic">
                  Offer Submission
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Configure your technical proposal for this procurement request.
                </p>
              </div>

              <SubmitQuoteForm
                requestId={request.id}
                sellerId={user?.id || ''}
                requestImages={request.imageUrls}
                category={request.category?.name || request.category}
                oemNumber={request.oemNumber}
                notes={request.notes}
                vehicleInfo={{
                  brand: request.vehicleBrand || t('defaults.unknown'),
                  model: request.vehicleModel || t('defaults.unknown'),
                  year: request.modelYear || t('defaults.unknown')
                }}
                layout="default"
                showContext={false}
                onSuccess={() => onOpenChange(false)}
              />
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

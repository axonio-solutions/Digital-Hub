'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Cpu,
  FileText,
  Info,
  MapPin,
  Package,
  Zap,
} from 'lucide-react'
import { SubmitQuoteForm } from './submit-quote-form'
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="sm:max-w-6xl w-[95vw] max-h-[90vh] p-0 border-none rounded-2xl shadow-2xl bg-card overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left: Technical Dossier */}
          <div className="w-full lg:w-1/2 bg-muted/30 p-6 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Cpu className="w-3 h-3" /> Technical Dossier
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tight leading-none">
                    {request.partName}
                  </h2>
                </div>
                {request.urgency === 'asap' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
                    <Zap className="w-3 h-3 fill-current" /> Priority
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="relative group aspect-video rounded-xl overflow-hidden border border-border bg-card">
                {request.imageUrls?.[0] ? (
                  <img
                    src={request.imageUrls[0]}
                    alt={request.partName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
                    <Package className="w-12 h-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Visual Available</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-md border border-border text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Inspection Image</span>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3" /> Vehicle
                  </div>
                  <div className="text-base font-black text-foreground uppercase leading-tight">
                    {request.vehicleBrand}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Year: {request.modelYear}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> OEM
                  </div>
                  <div className="text-base font-black text-foreground uppercase leading-tight truncate">
                    {request.oemNumber || 'N/A'}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Serial Number
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="text-base font-black text-foreground uppercase leading-tight">
                    {request.location || 'Algeria'}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Buyer Terminal
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Category
                  </div>
                  <div className="text-sm font-black text-primary uppercase leading-tight">
                    {tCategory(request.category?.name || request.category || request.categoryId, t)}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Classification
                  </div>
                </div>
              </div>

              {/* Notes */}
              {request.description && (
                <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border">
                  <div className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">
                    Procurement Directives
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">
                    &ldquo;{request.description}&rdquo;
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Offer Form */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 overflow-y-auto flex flex-col justify-center bg-card">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="mb-8">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">
                  Submit Your Quote
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Configure your offer for this procurement request.
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
                  year: request.modelYear || t('defaults.unknown'),
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

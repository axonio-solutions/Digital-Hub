'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Info,
  MapPin,
  Package,
  Zap,
} from 'lucide-react'
import { SubmitQuoteForm } from './submit-quote-form'
import { Button } from '@/components/ui/button'
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

function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/30 bg-card border border-border rounded-xl">
        <Package className="w-12 h-12" />
        <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="relative group aspect-video rounded-xl overflow-hidden border border-border bg-card">
        <img src={images[0]} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
    )
  }

  return (
    <div className="relative group aspect-video w-full overflow-hidden rounded-xl border border-border bg-card">
      <div 
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <img src={img} alt={`${alt} - ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))}
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight className="size-4" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`size-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
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
      <DialogContent className="sm:max-w-6xl w-full max-w-full sm:w-[95vw] max-h-[95vh] p-0 border-0 rounded-2xl shadow-2xl bg-card overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col-reverse lg:flex-row lg:h-full">
          {/* Left: Technical Dossier (below on mobile, side on desktop) */}
          <div className="w-full lg:w-1/2 bg-muted/30 p-4 sm:p-6 lg:p-10 overflow-y-auto border-t lg:border-t-0 lg:border-r border-border flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Cpu className="w-3 h-3" /> Request Details
                  </div>
                  <h2 className="text-xl lg:text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                    {request.partName}
                  </h2>
                </div>
                {request.urgency === 'asap' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                    <Zap className="w-3 h-3 fill-current" /> Priority
                  </div>
                )}
              </div>

              {/* Image */}
              <ImageSlider images={request.imageUrls || []} alt={request.partName} />

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3" /> Vehicle
                  </div>
                  <div className="text-sm font-black text-foreground uppercase leading-tight">
                    {request.vehicleBrand}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Year: {request.modelYear}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> OEM
                  </div>
                  <div className="text-sm font-black text-foreground uppercase leading-tight truncate">
                    {request.oemNumber || 'N/A'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="text-sm font-black text-foreground uppercase leading-tight">
                    {request.location || 'Algeria'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Category
                  </div>
                  <div className="text-sm font-black text-primary uppercase leading-tight">
                    {tCategory(request.category?.name || request.category || request.categoryId, t)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {request.description && (
                <div className="p-3 rounded-xl bg-muted/50 border border-dashed border-border">
                  <div className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-widest">
                    Buyer Notes
                  </div>
                  <p className="text-xs text-foreground/80 italic leading-relaxed">
                    &ldquo;{request.description}&rdquo;
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Offer Form (on top for mobile) */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-10 overflow-y-auto flex flex-col justify-center bg-card">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="mb-6">
                <h3 className="text-lg lg:text-xl font-black text-foreground uppercase tracking-tight mb-1">
                  Submit Your Quote
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
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

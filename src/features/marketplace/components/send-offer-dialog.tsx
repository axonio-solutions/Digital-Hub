'use client'

import React, { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Info,
  Loader2,
  MapPin,
  Package,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tCategory } from '@/utils/category-utils'
import { CategoryDisplay } from '@/components/ui/category-display'
import { cn } from '@/lib/utils'

const SubmitQuoteForm = lazy(() => import('./submit-quote-form').then(m => ({ default: m.SubmitQuoteForm })))

interface SendOfferDialogProps {
  request: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

function ImageSlider({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { t, i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'

  if (!images || images.length === 0) {
    return (
      <div className={cn('w-full flex flex-col items-center justify-center gap-3 text-muted-foreground/30 bg-card border border-border/60 rounded-2xl shadow-sm', className)}>
        <Package className="w-12 h-12" />
        <span className="text-[10px] font-black uppercase tracking-widest">{t('offer_dialog.no_image')}</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={cn('relative group rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm', className)}>
        <img src={images[0]} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
    )
  }

  return (
    <div className={cn('relative group w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm', className)}>
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(${isRtl ? '' : '-'}${currentIndex * 100}%)` }}
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
        className="absolute start-2 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="size-4 sm:size-5 rtl:-scale-x-100 text-foreground" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute end-2 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={() => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))}
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight className="size-4 sm:size-5 rtl:-scale-x-100 text-foreground" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === currentIndex ? "bg-white w-5" : "bg-white/50 hover:bg-white/80 w-1.5"
            )}
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
  const { t, i18n } = useTranslation('marketplace')
  const isRtl = i18n.dir() === 'rtl'

  if (!request) return null

  const detailsContent = (
    <div className="min-w-0 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5 shrink-0" /> {t('offer_dialog.request_details')}
          </div>
          {request.urgency === 'asap' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" /> {t('offer_dialog.priority')}
            </div>
          )}
        </div>
        <h2 
          className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight leading-snug break-words line-clamp-2 hover:line-clamp-none transition-all cursor-pointer"
          title={request.partName}
        >
          {request.partName}
        </h2>
      </div>

      {/* Image */}
      <ImageSlider images={request.imageUrls || []} alt={request.partName} className="w-full aspect-video lg:aspect-auto lg:flex-1 lg:min-h-[150px]" />

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0 shrink-0">
        <div className="flex flex-col p-2.5 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors min-w-0">
          <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-primary" /> {t('offer_dialog.vehicle')}
          </div>
          <div className="text-sm font-black text-foreground uppercase leading-tight break-words">
            {request.vehicleBrand}
          </div>
          <div className="text-xs font-bold text-muted-foreground mt-1">
            {t('offer_dialog.year')} {request.modelYear}
          </div>
        </div>

        <div className="flex flex-col p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors min-w-0">
          <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 shrink-0 text-primary" /> {t('offer_dialog.oem')}
          </div>
          <div className="text-sm font-black text-foreground uppercase leading-tight break-all">
            {request.oemNumber || t('offer_dialog.not_available')}
          </div>
        </div>

        <div className="flex flex-col p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors min-w-0">
          <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" /> {t('offer_dialog.location')}
          </div>
          <div className="text-sm font-black text-foreground uppercase leading-tight break-words">
            {request.location || t('offer_dialog.algeria')}
          </div>
        </div>

        <div className="flex flex-col p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors min-w-0">
          <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-primary" /> {t('offer_dialog.category')}
          </div>
          <div className="text-sm font-black text-primary uppercase leading-tight break-words flex items-center gap-1.5 flex-wrap">
            <CategoryDisplay category={request.category} showName={false} iconClassName="size-4" />
            <span>{tCategory(request.category?.name || request.category || request.categoryId, t)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {request.description && (
        <div className="p-4 rounded-2xl bg-muted/40 border border-dashed border-border/80 min-w-0 shrink-0 max-h-[120px] overflow-y-auto">
          <div className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">
            {t('offer_dialog.buyer_notes')}
          </div>
          <p className="text-sm text-foreground/90 italic leading-relaxed break-words whitespace-pre-wrap">
            &ldquo;{request.description}&rdquo;
          </p>
        </div>
      )}
    </div>
  )

  const offerContent = (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 sm:mb-6 shrink-0">
        <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight mb-1.5">
          {t('offer_dialog.submit_title')}
        </h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          {t('offer_dialog.submit_desc')}
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }>
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
        </Suspense>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir={isRtl ? 'rtl' : 'ltr'} className="sm:max-w-[1200px] w-[95vw] max-w-[calc(100vw-1rem)] max-h-[90dvh] p-0 border-0 rounded-3xl shadow-2xl bg-card overflow-hidden flex flex-col">
        {/* MOBILE: Tabbed Interface */}
        <div className="lg:hidden flex flex-col h-full min-h-0">
          <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
              <TabsList className="w-full grid grid-cols-2 h-12 bg-muted/60 rounded-xl p-1 gap-1">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                >
                  <FileText className="w-4 h-4 shrink-0 me-2" />
                  <span>{t('offer_dialog.details_tab')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="offer"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                >
                  <BadgeCheck className="w-4 h-4 shrink-0 me-2" />
                  <span>{t('offer_dialog.offer_tab')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="details"
              className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
            >
              {detailsContent}
            </TabsContent>

            <TabsContent
              value="offer"
              className="flex-1 overflow-y-auto p-4 sm:p-5 mt-0 data-[state=active]:flex data-[state=inactive]:hidden flex-col"
            >
              {offerContent}
            </TabsContent>
          </Tabs>
        </div>

        {/* DESKTOP: Side-by-side Layout */}
        <div className="hidden lg:flex lg:h-[80vh] min-h-[600px]">
          <div className="w-1/2 bg-muted/20 p-6 xl:p-8 flex flex-col border-e border-border/50 overflow-hidden">
            {detailsContent}
          </div>

          <div className="w-1/2 p-6 xl:p-8 flex flex-col bg-card overflow-hidden">
            {offerContent}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import {
  CarFront,
  LayoutList,
  PencilLine,
  Image as ImageIcon,
  CheckCircle2,
  Tag,
  Calendar,
  Hash
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProductFormData } from '@/types/product-schemas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReviewStepProps {
  onEditStep: (step: number) => void
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { t } = useTranslation('requests/form')
  const { watch } = useFormContext<ProductFormData>()

  const values = watch()
  const imageUrls = values.imageUrls || []

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.review.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.review.description')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Part Details Card */}
        <motion.div variants={item} className="flex flex-col bg-background border-2 border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/50">
             <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutList className="size-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('steps.review.cards.part')}</span>
             </div>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditStep(0)}
                className="size-7 rounded-lg hover:bg-background hover:text-primary transition-colors"
                type="button"
              >
                <PencilLine className="size-3.5" />
              </Button>
          </div>
          <div className="p-4 space-y-3">
              <div>
                <p className="text-lg font-bold text-foreground leading-tight tracking-tight mb-1">
                  {values.partName || '—'}
                </p>
                {values.vehicleBrand && (
                  <Badge variant="secondary" className="px-2.5 py-0.5 h-5 text-[10px] font-bold uppercase rounded-md tracking-wide">
                    {values.vehicleBrand}
                  </Badge>
                )}
              </div>
              <div className="pt-2 border-t border-dashed border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                  {values.description || t('steps.review.no_details')}
                </p>
              </div>
          </div>
        </motion.div>

        {/* Vehicle Info Card */}
        <motion.div variants={item} className="flex flex-col bg-background border-2 border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/50">
             <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CarFront className="size-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('steps.review.cards.vehicle')}</span>
             </div>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditStep(3)}
                className="size-7 rounded-lg hover:bg-background hover:text-primary transition-colors"
                type="button"
              >
                <PencilLine className="size-3.5" />
              </Button>
          </div>
          <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CarFront className="size-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wide">{t('labels.model')}</span>
                  </div>
                  <p className="text-sm font-bold truncate leading-none text-foreground">{values.vehicleModel || '—'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wide">{t('labels.year')}</span>
                  </div>
                  <p className="text-sm font-bold leading-none text-foreground">{values.modelYear || '—'}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Hash className="size-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wide">{t('labels.vin_number')}</span>
                </div>
                <p className="text-xs font-mono font-semibold text-foreground truncate tracking-wider uppercase">{values.vinNumber || t('steps.review.not_provided')}</p>
              </div>
          </div>
        </motion.div>

        {/* Photos Card */}
        <motion.div variants={item} className="md:col-span-2 flex flex-col bg-background border-2 border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/50">
             <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="size-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('steps.review.cards.media')} ({imageUrls.length})</span>
             </div>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(4)}
                className="h-7 text-[10px] uppercase font-bold tracking-wide px-3 hover:bg-background hover:text-primary transition-colors"
                type="button"
              >
                {t('buttons.edit')}
              </Button>
          </div>
          <div className="p-4">
            {imageUrls.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative shrink-0 size-20 rounded-lg overflow-hidden border border-border/50 bg-muted shadow-sm">
                    <img src={url} alt="Review" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-muted/20 border-2 border-dashed border-border/50 rounded-lg">
                <ImageIcon className="size-6 text-muted-foreground/40 mb-1.5" />
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">{t('steps.review.no_media')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Ready Status */}
      <motion.div
        variants={item}
        className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center gap-3 shadow-sm"
      >
        <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.4)]" />
        <p className="text-sm font-bold text-primary uppercase tracking-wide">
          {t('steps.review.ready_status')}
        </p>
      </motion.div>
    </motion.div>
  )
}

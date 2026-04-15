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
      transition: { staggerChildren: 0.08 }
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
      className="flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary" />
          Review & Publish
        </h3>
        <p className="text-sm text-muted-foreground">
          Review your request before publishing. Click edit to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Part Details */}
        <motion.div variants={item} className="rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <LayoutList className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide">Part Details</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditStep(0)}
              className="size-7 rounded-md hover:bg-background"
              type="button"
            >
              <PencilLine className="size-3.5" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-base font-bold leading-tight">
              {values.partName || '—'}
            </p>
            {values.vehicleBrand && (
              <Badge variant="secondary" className="text-xs">
                {values.vehicleBrand}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {values.description || 'No additional details.'}
            </p>
          </div>
        </motion.div>

        {/* Vehicle Info */}
        <motion.div variants={item} className="rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <CarFront className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide">Vehicle Info</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditStep(3)}
              className="size-7 rounded-md hover:bg-background"
              type="button"
            >
              <PencilLine className="size-3.5" />
            </Button>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Year</span>
                </div>
                <p className="text-sm font-semibold">{values.modelYear || '—'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CarFront className="size-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Model</span>
                </div>
                <p className="text-sm font-semibold truncate">{values.vehicleModel || '—'}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-dashed">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="size-3 text-muted-foreground" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">VIN</span>
              </div>
              <p className="text-xs font-mono font-medium uppercase tracking-wider">
                {values.vinNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Photos */}
        <motion.div variants={item} className="md:col-span-2 rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide">Photos ({imageUrls.length})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              className="h-6 text-xs"
              type="button"
            >
              Edit
            </Button>
          </div>
          <div className="p-4">
            {imageUrls.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((url, i) => (
                  <div key={i} className="shrink-0 size-16 rounded-md overflow-hidden border bg-muted">
                    <img src={url} alt="Review" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-muted/20 border-2 border-dashed rounded-md">
                <ImageIcon className="size-6 text-muted-foreground/40 mb-1.5" />
                <p className="text-xs font-medium text-muted-foreground/60">No media attached</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Ready Status */}
      <motion.div
        variants={item}
        className="p-3 border border-primary/20 bg-primary/5 rounded-lg flex items-center justify-center gap-2"
      >
        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
        <p className="text-sm font-semibold text-primary">
          Ready to publish
        </p>
      </motion.div>
    </motion.div>
  )
}

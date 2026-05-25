'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageSliderProps {
  images: Array<string | File>
  onRemove?: (index: number) => void
  isEditable?: boolean
  expandable?: boolean
  className?: string
  aspectRatio?: 'video' | 'square' | 'auto' | '4/3'
}

export function ImageSlider({
  images,
  onRemove,
  isEditable = false,
  expandable = false,
  className,
  aspectRatio = '4/3',
}: ImageSliderProps) {
  const { t, i18n } = useTranslation('common')
  const isRtl = i18n.dir() === 'rtl'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(Math.max(0, images.length - 1))
    }
  }, [images.length])

  // Memoize cleanup URLs
  const [previewUrls, setPreviewUrls] = React.useState<Array<string>>([])
  React.useEffect(() => {
    const urls = images.map((img) => {
      if (typeof img === 'string') return img
      return URL.createObjectURL(img)
    })
    setPreviewUrls(urls)
    return () => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [images])

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection)
      setCurrentIndex((prev) => {
        let next = prev + newDirection
        if (next < 0) next = images.length - 1
        if (next >= images.length) next = 0
        return next
      })
    },
    [images.length],
  )

  // ESC to close lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') paginate(isRtl ? -1 : 1)
      if (e.key === 'ArrowLeft') paginate(isRtl ? 1 : -1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, paginate, isRtl])

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-border text-muted-foreground',
          aspectRatio === '4/3' && 'aspect-[4/3]',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === 'square' && 'aspect-square',
          className,
        )}
      >
        <span className="material-symbols-outlined text-4xl opacity-20">
          image
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">
          {t('image_slider.no_images')}
        </p>
      </div>
    )
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: (isRtl ? -1 : 1) * (dir > 0 ? 300 : -300),
      opacity: 0,
      scale: 0.95,
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      zIndex: 0,
      x: (isRtl ? -1 : 1) * (dir < 0 ? 300 : -300),
      opacity: 0,
      scale: 1.05,
    }),
  }

  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity
  const SWIPE_THRESHOLD = 10000

  const currentUrl = previewUrls[currentIndex]

  // ── Lightbox ────────────────────────────────────────────────────────────────

  const lightbox =
    lightboxOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/96 backdrop-blur-sm"
        onClick={() => setLightboxOpen(false)}
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => setLightboxOpen(false)}
          className="absolute top-4 right-4 z-10 size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold tabular-nums">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Image */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -SWIPE_THRESHOLD) paginate(isRtl ? -1 : 1)
              else if (swipe > SWIPE_THRESHOLD) paginate(isRtl ? 1 : -1)
            }}
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-10 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {currentUrl && (
              <img
                src={currentUrl}
                alt={t('image_slider.slide', { index: currentIndex + 1 })}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl select-none shadow-2xl"
                style={{ maxHeight: 'calc(100dvh - 80px)' }}
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 size-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                paginate(-1)
              }}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 size-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                paginate(1)
              }}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/8 backdrop-blur-sm max-w-[min(600px,90vw)] flex-wrap justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {previewUrls.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1)
                  setCurrentIndex(i)
                }}
                className={cn(
                  'size-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0',
                  i === currentIndex
                    ? 'border-white/80 scale-110'
                    : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100',
                )}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>,
      document.body,
    )

  // ── Slider ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={cn(
          'relative group overflow-hidden rounded-2xl bg-muted/40 border border-border/50',
          aspectRatio === '4/3' && 'aspect-[4/3]',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === 'square' && 'aspect-square',
          expandable && 'cursor-zoom-in',
          className,
        )}
        onClick={expandable ? () => setLightboxOpen(true) : undefined}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -SWIPE_THRESHOLD) paginate(isRtl ? -1 : 1)
              else if (swipe > SWIPE_THRESHOLD) paginate(isRtl ? 1 : -1)
            }}
            className="absolute inset-0 w-full h-full"
          >
            {currentUrl && (
              <img
                src={currentUrl}
                alt={t('image_slider.slide', { index: currentIndex + 1 })}
                className="w-full h-full object-contain select-none"
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Expand button */}
        {expandable && (
          <button
            type="button"
            className="absolute top-3 right-3 z-10 size-8 flex items-center justify-center rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(true)
            }}
            aria-label="Expand image"
          >
            <Maximize2 className="size-3.5" />
          </button>
        )}

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-black/80 text-foreground shadow-xl backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border/50"
              onClick={(e) => {
                e.stopPropagation()
                paginate(-1)
              }}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-black/80 text-foreground shadow-xl backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border/50"
              onClick={(e) => {
                e.stopPropagation()
                paginate(1)
              }}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Editable remove */}
        {isEditable && onRemove && (
          <div className="absolute top-4 end-4 z-20">
            <Button
              size="icon"
              variant="destructive"
              type="button"
              className="size-10 rounded-xl shadow-xl hover:scale-110 transition-transform active:scale-90"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(currentIndex)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}

        {/* Dot strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/40',
                )}
              />
            ))}
          </div>
        )}

        {/* Counter badge */}
        {images.length > 0 && (
          <div className="absolute bottom-4 end-4 z-10">
            <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-tighter border border-white/10 px-2 py-0.5 rounded-md pointer-events-none">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      {lightbox}
    </>
  )
}

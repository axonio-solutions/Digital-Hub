'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageSliderProps {
  images: (string | File)[]
  onRemove?: (index: number) => void
  isEditable?: boolean
  className?: string
  aspectRatio?: 'video' | 'square' | 'auto' | '4/3'
}

export function ImageSlider({
  images,
  onRemove,
  isEditable = false,
  className,
  aspectRatio = '4/3'
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Auto-reset index if images length changes
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(Math.max(0, images.length - 1))
    }
  }, [images.length])

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-all duration-300",
        aspectRatio === '4/3' && "aspect-[4/3]",
        aspectRatio === 'video' && "aspect-video",
        aspectRatio === 'square' && "aspect-square",
        className
      )}>
        <span className="material-symbols-outlined text-4xl opacity-20">image</span>
        <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">No Images Available</p>
      </div>
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 1.05
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = images.length - 1
      if (nextIndex >= images.length) nextIndex = 0
      return nextIndex
    })
  }

  // Memoize cleanup URLs to avoid memory leaks
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])

  React.useEffect(() => {
    const urls = images.map(img => {
      if (typeof img === 'string') return img
      return URL.createObjectURL(img)
    })
    setPreviewUrls(urls)
    
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [images])

  const currentUrl = previewUrls[currentIndex]

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 border border-border/50 shadow-sm",
      aspectRatio === '4/3' && "aspect-[4/3]",
      aspectRatio === 'video' && "aspect-video",
      aspectRatio === 'square' && "aspect-square",
      className
    )}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.3 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {currentUrl && (
            <img
              src={currentUrl}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-contain select-none bg-slate-950"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-black/80 text-foreground shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border/50"
            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-black/80 text-foreground shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 border border-border/50"
            onClick={(e) => { e.stopPropagation(); paginate(1); }}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Overlays */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {isEditable && onRemove && (
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
        )}
      </div>

      {/* Counter/Index - Progress Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === currentIndex ? "w-5 bg-primary" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      )}

      {/* Badge Indicator */}
      {images.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-tighter border border-white/10 px-2 py-0.5 rounded-md pointer-events-none">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

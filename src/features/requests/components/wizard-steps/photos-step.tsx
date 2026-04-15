'use client'

import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { Camera, Loader2, Trash2, UploadCloud, ImagePlus, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductFormData } from '@/types/product-schemas'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

export function PhotosStep() {
  const { t } = useTranslation('requests/form')
  const { data: user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const {
    setValue,
    watch,
  } = useFormContext<ProductFormData>()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<Array<File>>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const imageUrls = watch('imageUrls') || []

  // Combine uploaded URLs and local selected files for preview
  const allImages = [
    ...imageUrls.map((url, idx) => ({ type: 'url' as const, url, id: `url-${idx}`, originalIndex: idx })),
    ...selectedImages.map((file, idx) => ({
      type: 'file' as const,
      file,
      id: `file-${idx}`,
      previewUrl: URL.createObjectURL(file),
      originalIndex: idx
    })),
  ]

  const handleRemoveImage = (item: typeof allImages[0]) => {
    if (item.type === 'url') {
      const newUrls = imageUrls.filter((_, i) => i !== item.originalIndex)
      setValue('imageUrls', newUrls)
    } else {
      setSelectedImages((prev) => prev.filter((_, i) => i !== item.originalIndex))
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newFiles = Array.from(files)
    setSelectedImages((prev) => [...prev, ...newFiles])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleUpload = async () => {
    if (selectedImages.length === 0 || !user?.id) return

    setIsUploading(true)
    setUploadProgress(0)
    const finalImageUrls = [...imageUrls]

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('requests-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('requests-photos').getPublicUrl(filePath)

        finalImageUrls.push(publicUrl)
        setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100))
      }

      setValue('imageUrls', finalImageUrls)
      setSelectedImages([])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Header Section */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <div className="size-9 rounded-lg bg-background border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
          <Camera className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">
            {t('steps.photos.title')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('steps.photos.description')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Upload Status */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5 p-4 bg-primary/5 rounded-xl border border-primary/20 overflow-hidden"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-xs uppercase font-bold text-primary flex items-center gap-2 tracking-wide">
                  <Loader2 className="size-4 animate-spin" />
                  {t('buttons.uploading')}
                </span>
                <span className="text-xs font-bold text-primary">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Zone */}
        <div
          ref={dropZoneRef}
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[130px] rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.02]"
              : allImages.length > 0
              ? "border-border/50 bg-muted/20 hover:bg-muted/30 hover:border-primary/40"
              : "border-border/70 bg-muted/30 hover:bg-muted/40 hover:border-primary/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
              className={cn(
                "size-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                isDragOver
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-background border-2 border-border shadow-sm text-primary"
              )}
            >
              {isDragOver ? (
                <CheckCircle2 className="size-6" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </motion.div>
            <p className="font-semibold text-foreground text-sm tracking-tight mb-0.5">
              {allImages.length > 0 ? t('labels.add_more_photos') : t('labels.upload_photos')}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {t('steps.photos.dropzone_hint')}
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Photo Grid */}
        <AnimatePresence mode="popLayout">
          {allImages.length > 0 && (
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {allImages.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.type === 'url' ? item.url : item.previewUrl}
                    alt="Attached"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(item)
                      }}
                      className="size-8 rounded-lg shadow-lg"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {item.type === 'file' && (
                    <div className="absolute inset-x-0 bottom-0 bg-primary/95 py-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="size-3 text-white" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-tighter">
                        {t('steps.photos.ready')}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <AnimatePresence>
          {selectedImages.length > 0 && !isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-2">
                <ImagePlus className="size-4 text-primary" />
                  {t('steps.photos.pending_count', { count: selectedImages.length })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImages([])}
                  className="h-9 text-xs font-semibold px-4"
                >
                  {t('buttons.clear')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpload}
                  className="h-9 px-5 text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20"
                >
                  {t('buttons.upload')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

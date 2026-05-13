'use client'

import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { Camera, Loader2, Trash2, UploadCloud, CheckCircle2 } from 'lucide-react'
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

  const { setValue, watch } = useFormContext<ProductFormData>()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<Array<File>>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const imageUrls = watch('imageUrls') || []

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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newFiles = Array.from(files)
    setSelectedImages((prev) => [...prev, ...newFiles])
    uploadFiles(newFiles)
  }

  const uploadFiles = useCallback(async (filesToUpload: Array<File>) => {
    if (filesToUpload.length === 0 || !user?.id) return

    setIsUploading(true)
    setUploadProgress(0)
    const finalImageUrls = [...imageUrls]

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
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
        setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100))
      }

      setValue('imageUrls', finalImageUrls)
      setSelectedImages([])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [imageUrls, user?.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Camera className="size-5 text-primary" />
          {t('steps.photos.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('steps.photos.description')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Status */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  {t('buttons.uploading')}
                </span>
                <span className="text-xs font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Grid */}
        <AnimatePresence mode="popLayout">
          {allImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {allImages.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <img
                    src={item.type === 'url' ? item.url : item.previewUrl}
                    alt="Attached"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(item)
                      }}
                      className="size-7"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {item.type === 'file' && (
                    <div className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white uppercase">{t('steps.photos.ready')}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Add Photos Button */}
        <div className="flex flex-col gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2 h-12 border-2 border-dashed hover:border-primary hover:bg-primary/5"
          >
            <UploadCloud className="size-5" />
            {allImages.length > 0 ? t('steps.photos.add_more', 'Add More Photos') : t('steps.photos.add_photos', 'Add Photos')}
          </Button>

          {/* Upload indicator */}
          {selectedImages.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {t('steps.photos.uploading', { count: selectedImages.length })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

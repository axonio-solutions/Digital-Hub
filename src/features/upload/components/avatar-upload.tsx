'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2, Camera, User, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { updateProfileServerFn } from '@/fn/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

interface AvatarUploadProps {
  userId: string
  currentImage?: string | null
  name?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({
  userId,
  currentImage,
  className,
  size = 'md',
  onUploadComplete,
}: AvatarUploadProps) {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [displayImage, setDisplayImage] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'size-12',
    md: 'size-20',
    lg: 'size-32',
    xl: 'size-40',
  }[size]

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName)

      await updateProfileServerFn({
        data: {
          userId,
          image: publicUrl
        }
      })

      setDisplayImage(publicUrl)
      onUploadComplete?.(publicUrl)
      
      // Force sync navigation bar and other auth-dependent UIs
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      
      toast.success('Profile picture updated!')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsUploading(true)
      await updateProfileServerFn({
        data: {
          userId,
          updates: { image: null }
        }
      })
      setDisplayImage(null)
      
      // Force sync navigation bar
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      
      toast.success('Profile picture removed')
    } catch (error: any) {
      toast.error('Failed to remove image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div className="relative group">
        <div 
          className={cn(
            "relative rounded-full border-4 border-background shadow-xl overflow-hidden transition-all duration-300 ring-1 ring-primary/5",
            sizeClasses,
            isUploading ? "opacity-50" : "hover:ring-primary/20 cursor-pointer"
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage src={displayImage || undefined} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground border-none">
              <User className="size-1/2 opacity-20" />
            </AvatarFallback>
          </Avatar>

          {/* Loading Spinner */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-10">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          )}

          {/* Simple Hover Fade */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
        </div>

        {/* Floating Action Button - Now correctly anchored to the profile photo container */}
        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg border-2 border-background hover:scale-110 active:scale-95 transition-all z-20"
            title="Change profile picture"
          >
            <Camera className="size-4" />
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleUpload}
      />

      {displayImage && !isUploading && (
        <div className="mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            className="h-7 px-3 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold uppercase tracking-tighter"
          >
            <Trash2 className="size-3 me-1.5" />
            Remove Picture
          </Button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'
import { categorySchema, type CategoryInput } from '@/features/taxonomy/validations/taxonomy'
import { useCreateCategory, useUpdateCategory } from '../hooks/use-taxonomy'

interface Category {
  id: string
  name: string
  description: string | null
  imageUrl?: string | null
  status: 'active' | 'draft' | 'archived'
}

interface CategoryDialogProps {
  editingItem: Category | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryDialog({
  editingItem,
  isOpen,
  onOpenChange,
}: CategoryDialogProps) {
  const { t } = useTranslation('dashboard/taxonomy')
  const { toast } = useToast('dashboard/taxonomy')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        description: editingItem.description || '',
        imageUrl: editingItem.imageUrl || '',
        status: editingItem.status as any
      })
      setPreviewImage(editingItem.imageUrl || null)
    } else {
      form.reset({ name: '', description: '', imageUrl: '', status: 'active' })
      setPreviewImage(null)
    }
  }, [editingItem, form, isOpen])

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('dialog.toast_upload_error'); return }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `categories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('taxonomy')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('taxonomy').getPublicUrl(fileName)
      form.setValue('imageUrl', publicUrl)
      setPreviewImage(publicUrl)
      toast.success('dialog.toast_upload_success')
    } catch (error: any) {
      toast.error('dialog.toast_upload_failed', { error: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    form.setValue('imageUrl', '')
    setPreviewImage(null)
  }

  const onSubmit = (values: CategoryInput) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, data: values })
    else createMutation.mutate(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-space italic uppercase font-black text-2xl tracking-tighter">
            {editingItem ? t('dialog.edit_title') : t('dialog.create_title')}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium leading-relaxed">
            {t('dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Image Upload */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="size-16 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                  <AvatarImage src={previewImage || undefined} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl text-lg font-black">
                    {form.watch('name')?.substring(0, 2).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                    <Loader2 className="size-5 text-primary animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Button type="button" variant="outline" size="sm" className="w-full h-9 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                  onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="size-3.5 me-1.5" /> {t('dialog.upload_icon')}
                </Button>
                {previewImage && (
                  <Button type="button" variant="ghost" size="sm" className="w-full h-7 text-[10px] text-muted-foreground hover:text-destructive rounded-lg"
                    onClick={handleRemoveImage}>
                    <Trash2 className="size-3 me-1" /> {t('dialog.remove_image')}
                  </Button>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('dialog.name_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('dialog.name_placeholder')} {...field} className="h-11 font-bold text-xs rounded-xl" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('dialog.description_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('dialog.description_placeholder')} {...field} value={field.value || ''} className="h-11 font-bold text-xs rounded-xl" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('dialog.status_label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl><SelectTrigger className="h-11 font-bold text-xs rounded-xl"><SelectValue placeholder={t('dialog.status_placeholder')} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs font-bold">{t('dialog.status_active')}</SelectItem>
                      <SelectItem value="draft" className="text-xs font-bold">{t('dialog.status_draft')}</SelectItem>
                      <SelectItem value="archived" className="text-xs font-bold">{t('dialog.status_archived')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin me-2" size={16} /> : null}
                {editingItem ? t('dialog.submit_edit') : t('dialog.submit_create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

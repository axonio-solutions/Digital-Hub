import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { useCreateBrand, useUpdateBrand } from '../hooks/use-taxonomy'
import type { BrandInput } from '@/features/taxonomy/validations/taxonomy'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'
import { brandSchema } from '@/features/taxonomy/validations/taxonomy'

interface Brand {
  id: string
  brand: string
  clusterOrigin: string
  clusterRegion: string
  imageUrl?: string | null
  status: 'active' | 'draft' | 'archived'
}

export function BrandDialog({
  open,
  onOpenChange,
  editingItem,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem?: Brand | null
}) {
  const { toast } = useToast('dashboard/taxonomy')
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      brand: '',
      clusterOrigin: '',
      clusterRegion: '',
      imageUrl: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        brand: editingItem.brand,
        clusterOrigin: editingItem.clusterOrigin,
        clusterRegion: editingItem.clusterRegion,
        imageUrl: editingItem.imageUrl || '',
        status: editingItem.status as any,
      })
      setPreviewImage(editingItem.imageUrl || null)
    } else {
      form.reset({
        brand: '',
        clusterOrigin: '',
        clusterRegion: '',
        imageUrl: '',
        status: 'active',
      })
      setPreviewImage(null)
    }
  }, [editingItem, form, open])

  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('dialog.toast_upload_error')
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `brands/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('taxonomy')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('taxonomy').getPublicUrl(fileName)
      form.setValue('imageUrl', publicUrl)
      setPreviewImage(publicUrl)
      toast.success('dialog.toast_upload_success')
    } catch (error: any) {
      toast.error('dialog.toast_upload_failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    form.setValue('imageUrl', '')
    setPreviewImage(null)
  }

  const onSubmit = (values: BrandInput) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, data: values })
    else createMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-space italic uppercase font-black text-2xl tracking-tighter">
            {editingItem ? 'Edit Brand' : 'Create Brand Cluster'}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium leading-relaxed">
            Define vehicle clusters and manufacturer specifications. This
            influences AI-driven demand forecasting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            {/* Image Upload */}
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="size-16 rounded-xl border-2 border-slate-200 dark:border-slate-800">
                  <AvatarImage
                    src={previewImage || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 rounded-xl text-lg font-black">
                    {form.watch('brand')?.substring(0, 2).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                    <Loader2 className="size-5 text-primary animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="size-3.5 me-1.5" /> Upload Logo
                </Button>
                {previewImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-[10px] text-muted-foreground hover:text-destructive rounded-lg"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="size-3 me-1" /> Remove
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Manufacturer Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Hyundai"
                      {...field}
                      className="h-11 font-bold text-xs rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clusterOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Cluster Origin
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., South Korea, Japan, Germany..."
                      {...field}
                      className="h-11 font-bold text-xs rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clusterRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Cluster Region
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Asian, European, Mercosur..."
                      {...field}
                      className="h-11 font-bold text-xs rounded-xl"
                    />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Taxonomy Status
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 font-bold text-xs rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs font-bold">
                        Active
                      </SelectItem>
                      <SelectItem value="draft" className="text-xs font-bold">
                        Draft
                      </SelectItem>
                      <SelectItem
                        value="archived"
                        className="text-xs font-bold"
                      >
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  isUploading
                }
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="animate-spin me-2" size={16} />
                ) : null}
                {editingItem ? 'Update Cluster' : 'Deploy Cluster'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

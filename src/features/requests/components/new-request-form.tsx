'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { 
  Camera, 
  Car, 
  Loader2, 
  Plus, 
  UploadCloud, 
  XIcon, 
  Search, 
  Settings2, 
  Info, 
  LayoutGrid,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { productFormSchema } from '../validations/product-schemas'
import { useCreateRequest, useUpdateRequest } from '../hooks/use-requests'
import type { ProductFormData } from '../validations/product-schemas'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTaxonomy } from '@/features/taxonomy/hooks/use-taxonomy'
import { tCategory } from '@/utils/category-utils'
import { cn } from '@/lib/utils'

interface NewPartRequestFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewPartRequestForm({
  initialData,
  onSuccess,
  onCancel,
}: NewPartRequestFormProps) {
  const { data: user } = useAuth()
  const createRequest = useCreateRequest()
  const updateRequest = useUpdateRequest()
  const isEditing = !!initialData
  const { data: taxonomy, isLoading: isLoadingTaxonomy } = useTaxonomy()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<Array<File>>([])

  const { t } = useTranslation('requests/form')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      partName: initialData?.partName || '',
      description: initialData?.notes || '',
      status: initialData ? 'published' : 'published',
      vehicleBrand: initialData?.vehicleBrand || '',
      vehicleModel: initialData?.modelYear ? initialData.modelYear.split(' ')[0] : '',
      modelYear: initialData?.modelYear ? initialData.modelYear.split(' ').slice(1).join(' ') : '',
      categories: initialData?.category ? [initialData.category.name] : [],
      categoryId: initialData?.categoryId || undefined,
      brandId: initialData?.brandId || undefined,
      tags: [],
      variations: [],
      expectedPrice: '',
      budgetType: 'negotiable',
      template: 'default',
      imageUrls: initialData?.imageUrls || [],
    },
  })

  const imageUrls = watch('imageUrls') || []

  const handleRemoveImage = (index: number) => {
    if (index < imageUrls.length) {
      const newUrls = [...imageUrls]
      newUrls.splice(index, 1)
      setValue('imageUrls', newUrls)
    } else {
      const localIdx = index - imageUrls.length
      setSelectedImages(prev => prev.filter((_, i) => i !== localIdx))
    }
  }

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      toast.error(t('toasts.login_required'))
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    const finalImageUrls = [...imageUrls]

    try {
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('requests-photos')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('requests-photos')
            .getPublicUrl(filePath)

          finalImageUrls.push(publicUrl)
          setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100))
        }
      }

      const payload = {
        buyerId: user.id,
        partName: data.partName,
        categoryId: data.categoryId,
        brandId: data.brandId,
        vehicleBrand: data.vehicleBrand,
        modelYear: `${data.vehicleModel} ${data.modelYear}`,
        notes: data.description,
        status: data.status === 'draft' ? 'draft' : 'open',
        imageUrls: finalImageUrls,
      }

      if (isEditing) {
        await (updateRequest as any).mutateAsync({ id: initialData.id, payload })
        toast.success(t('toasts.update_success'))
      } else {
        await (createRequest as any).mutateAsync(payload)
        toast.success(t('toasts.create_success'))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || t('toasts.process_error'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] tracking-widest italic mb-1">
                <Car className="size-3" />
                Service Requisition
             </div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">
                {isEditing ? 'Update Request' : 'Submit New Request'}
             </h1>
             <p className="text-sm text-slate-500 font-medium">Broadcast your needs to verified sellers across the network.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Car className="size-4 text-slate-400" />
                  </div>
                ))}
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect with 50+ Experts</p>
          </div>
       </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        {/* Core Layout - Seamless Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: Item Identification */}
            <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500">
               <div className="p-8 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Search className="size-6" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white italic">Item Identification</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Define what you are looking for</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label htmlFor="partName" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                          Part Name / Keyword <span className="text-primary">*</span>
                       </Label>
                       <div className="relative group/input">
                          <Input
                            id="partName"
                            placeholder={t('placeholders.part_name')}
                            {...register('partName')}
                            className="h-14 text-lg font-bold rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all pl-6"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                             <ChevronRight className="size-5 text-primary" />
                          </div>
                       </div>
                       {errors.partName && (
                         <p className="text-[10px] font-bold uppercase text-rose-500 mt-1 ml-1">{errors.partName.message}</p>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label htmlFor="categoryId" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">{t('labels.category')}</Label>
                         <Select
                           defaultValue={initialData?.categoryId}
                           value={watch('categoryId')}
                           onValueChange={(val) => setValue('categoryId', val)}
                           disabled={isLoadingTaxonomy}
                         >
                           <SelectTrigger id="categoryId" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                             <SelectValue placeholder={isLoadingTaxonomy ? t('placeholders.category_loading') : t('placeholders.category_select')} />
                           </SelectTrigger>
                           <SelectContent>
                             {taxonomy?.categories.map((c: any) => (
                               <SelectItem key={c.id} value={c.id} className="font-medium">
                                 {tCategory(c.name, t)}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                         <Info className="size-4 text-primary shrink-0" />
                         <p className="text-[10px] text-slate-400 font-medium leading-tight">
                            Correct categorization speeds up expert matching by up to 40%.
                         </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="description" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">{t('labels.description')}</Label>
                       <Textarea
                         id="description"
                         placeholder={t('placeholders.description')}
                         className="min-h-[140px] rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all p-6 text-sm font-medium italic"
                         {...register('description')}
                       />
                    </div>
                  </div>
               </div>
            </div>

            {/* Section 2: Machine Specifications */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden group/machine">
               <div className="p-8 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover/machine:text-primary transition-colors">
                        <Settings2 className="size-6" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white italic">Machine Specifications</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help us verify compatibility</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label htmlFor="brandId" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                          Manufacturer <span className="text-primary">*</span>
                       </Label>
                       <Select
                         defaultValue={initialData?.brandId}
                         value={watch('brandId')}
                         onValueChange={(val) => {
                           const brand = taxonomy?.brands.find((b: any) => b.id === val)
                           setValue('brandId', val)
                           setValue('vehicleBrand', brand?.brand || '')
                         }}
                         disabled={isLoadingTaxonomy}
                       >
                         <SelectTrigger id="brandId" className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold">
                           <SelectValue placeholder={isLoadingTaxonomy ? t('placeholders.brand_loading') : t('placeholders.brand_select')} />
                         </SelectTrigger>
                         <SelectContent>
                           {taxonomy?.brands.map((b: any) => (
                             <SelectItem key={b.id} value={b.id} className="font-bold">
                               {b.brand}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="vehicleModel" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                          Model Series <span className="text-primary">*</span>
                       </Label>
                       <Input
                         id="vehicleModel"
                         placeholder={t('placeholders.model')}
                         {...register('vehicleModel')}
                         className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold pl-6"
                       />
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="modelYear" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                          Release Year <span className="text-primary">*</span>
                       </Label>
                       <Input
                         id="modelYear"
                         placeholder={t('placeholders.year')}
                         {...register('modelYear')}
                         className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold pl-6"
                       />
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="vinNumber" className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">VIN / Chassis (Optional)</Label>
                       <Input
                         id="vinNumber"
                         placeholder={t('placeholders.vin')}
                         {...register('vinNumber')}
                         className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium pl-6 text-sm"
                       />
                    </div>
                  </div>
               </div>
            </div>

            {/* Section 3: Visual Documentation */}
            <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group/media transition-all duration-500">
               <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 group-hover/media:scale-110 transition-transform">
                           <Camera className="size-6" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white italic">Visual Documentation</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attach photos for better accuracy</p>
                        </div>
                     </div>
                     {!isUploading && imageUrls.length + selectedImages.length > 0 && (
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              if (e.target.files) {
                                setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)])
                              }
                            }}
                          />
                          <Button variant="outline" size="sm" type="button" className="h-10 rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest border-2">
                            <Plus className="size-3" /> Add More
                          </Button>
                        </div>
                     )}
                  </div>

                  {isUploading && (
                    <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                      <div className="flex justify-between items-center px-1 mb-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{t('buttons.uploading')}...</span>
                        <span className="text-[10px] font-bold text-primary">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} variant="primary" className="h-2" />
                    </div>
                  )}

                  <div className={cn(
                    "grid gap-4",
                    imageUrls.length + selectedImages.length > 0 
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
                      : "grid-cols-1"
                  )}>
                    {imageUrls.map((url, idx) => (
                      <div key={`url-${idx}`} className="relative aspect-square group rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <img src={url} alt="Attached" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 size-8 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 flex items-center justify-center shadow-lg"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    ))}

                    {selectedImages.map((file, idx) => {
                      const previewUrl = URL.createObjectURL(file)
                      return (
                        <div key={`local-${idx}`} className="relative aspect-square group rounded-2xl overflow-hidden shadow-sm border-2 border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-300">
                          <img src={previewUrl} alt="Local" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imageUrls.length + idx)}
                            className="absolute top-2 right-2 size-8 bg-primary/80 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                          >
                            <XIcon className="size-4" />
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-primary/20 h-1" />
                        </div>
                      )
                    })}

                    {/* Empty State Dropzone */}
                    {imageUrls.length === 0 && selectedImages.length === 0 && (
                      <div className="relative group/zone py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files) {
                              setSelectedImages(Array.from(e.target.files))
                            }
                          }}
                        />
                        <div className="size-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center mb-6 group-hover/zone:scale-110 transition-transform duration-500">
                          <UploadCloud className="size-8 text-primary" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t('placeholders.photos_empty')}</h4>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-2">{t('hints.photos_empty')}</p>
                        
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm opacity-50">
                           <ShieldCheck className="size-3 text-emerald-500" />
                           <span className="text-[8px] font-bold uppercase tracking-widest">Verified Vault</span>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status & Options */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -ml-12 -mb-12" />
               
               <div className="relative space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <h3 className="text-sm font-bold uppercase tracking-widest italic">{t('labels.status')}</h3>
                  </div>

                  <Select
                    defaultValue="published"
                    onValueChange={(val: any) => setValue('status', val)}
                  >
                    <SelectTrigger className="w-full h-14 bg-white/10 border-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all outline-none ring-0">
                      <SelectValue placeholder={initialData?.status || t('status.published')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published" className="font-bold">{t('status.published')}</SelectItem>
                      <SelectItem value="draft" className="font-bold">{t('status.draft')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                     <div className="flex items-center justify-between group cursor-default">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Expert Matching</span>
                        <Badge className="bg-emerald-500 text-white border-none text-[8px] uppercase tracking-widest px-2 font-bold h-4">Enabled</Badge>
                     </div>
                     <div className="flex items-center justify-between group cursor-default">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Geo-Discovery</span>
                        <Badge className="bg-blue-500 text-white border-none text-[8px] uppercase tracking-widest px-2 font-bold h-4">Algeria</Badge>
                     </div>
                  </div>
               </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6">
               <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <LayoutGrid className="size-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest italic">Compliance</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                     <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{t('hints.guidelines1')}</p>
                  </div>
                  <div className="flex items-start gap-3 group">
                     <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{t('hints.guidelines2')}</p>
                  </div>
               </div>
               
               <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                     <Info className="size-3 text-primary" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Need help? Ask an Specialist.</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
           <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="h-14 px-8 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                {t('buttons.cancel')}
              </Button>
              
              <Button
                type="submit"
                className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
                disabled={isUploading || createRequest.isPending || updateRequest.isPending}
              >
                {(isUploading || createRequest.isPending || updateRequest.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin font-black" />
                    {isUploading ? `${t('buttons.uploading')} ${uploadProgress}%` : t('buttons.syncing')}
                  </>
                ) : (
                   <>
                     <span>{isEditing ? t('buttons.update') : 'Publish Broadcast'}</span>
                     <ChevronRight className="size-4" />
                   </>
                )}
              </Button>
           </div>
        </div>
      </form>
    </div>
  )
}

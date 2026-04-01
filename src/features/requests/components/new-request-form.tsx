'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Camera, Car, Loader2, PlusIcon, UploadCloud, XIcon, X, Plus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  productFormSchema
} from '../validations/product-schemas'
import { useCreateRequest, useUpdateRequest } from '../hooks/use-requests'
import type { ProductFormData } from '../validations/product-schemas';
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      toast.error('You must be logged in to create or edit a request')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    const finalImageUrls = [...imageUrls]

    try {
      // 1. Batch Upload Local Images
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

      // 2. Persist to DB
      if (isEditing) {
        await (updateRequest as any).mutateAsync({ id: initialData.id, payload })
        toast.success('Part request updated successfully!')
      } else {
        await (createRequest as any).mutateAsync(payload)
        toast.success('Part request submitted successfully!')
      }
      
      // Artificial grace period
      await new Promise(resolve => setTimeout(resolve, 500))
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to process request')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="mx-auto max-w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* General Section */}
            <Card className="shadow-none border-muted-foreground/20">
              <CardHeader>
                <CardTitle className="text-lg">Part Information</CardTitle>
                <CardDescription>
                  Specify what part you need and add details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="partName">
                    Part Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="partName"
                    placeholder="e.g. Brake Pads, Front Bumper"
                    {...register('partName')}
                  />
                  {errors.partName && (
                    <p className="text-sm text-red-500">
                      {errors.partName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      defaultValue={initialData?.categoryId}
                      value={watch('categoryId')}
                      onValueChange={(val) => setValue('categoryId', val)}
                      disabled={isLoadingTaxonomy}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder={isLoadingTaxonomy ? "Loading Categories..." : "Select Category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {taxonomy?.categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <p className="text-[11px] text-muted-foreground italic mb-1">
                      Choose the closest category for accurate seller matching.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide any specific details, OEM numbers, or special requirements."
                    className="min-h-[120px]"
                    {...register('description')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details Section */}
            <Card className="shadow-none border-muted-foreground/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="size-5" />
                  Vehicle Specification
                </CardTitle>
                <CardDescription>
                  Determine vehicle compatibility here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandId">
                      Brand <span className="text-red-500">*</span>
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
                      <SelectTrigger id="brandId">
                        <SelectValue placeholder={isLoadingTaxonomy ? "Loading Brands..." : "Select Brand"} />
                      </SelectTrigger>
                      <SelectContent>
                        {taxonomy?.brands.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vehicleModel"
                      placeholder="Camry, Golf, etc."
                      {...register('vehicleModel')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelYear">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="modelYear"
                      placeholder="2018"
                      {...register('modelYear')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vinNumber">VIN Number (Optional)</Label>
                    <Input
                      id="vinNumber"
                      placeholder="Chassis No."
                      {...register('vinNumber')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simplified Media Section (Grid View) */}
            <Card className="shadow-none border-muted-foreground/20 overflow-hidden">
              <CardHeader className="bg-muted/5 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                       <Camera className="size-5 text-primary" />
                       Part Photos
                    </CardTitle>
                    <CardDescription className="text-xs">
                       Add live photos of your broken parts for best results.
                    </CardDescription>
                  </div>
                  {!isUploading && (
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
                        <Button variant="outline" size="sm" type="button" className="h-8 rounded-lg gap-2">
                           <Plus className="size-3 mr-1" /> Add Photos
                        </Button>
                     </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {isUploading && (
                   <div className="mb-6 space-y-2 p-3 bg-secondary/20 rounded-xl border border-border/50">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Encrypting Assets...</span>
                        <span className="text-[10px] font-bold text-primary">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} variant="primary" className="h-2" />
                   </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imageUrls.map((url, idx) => (
                    <div key={`url-${idx}`} className="relative aspect-square group rounded-xl overflow-hidden shadow-sm border border-border bg-muted/20">
                      <img src={url} alt="Attached" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 flex items-center justify-center"
                      >
                         <XIcon className="size-3 mr-1" /> Remove
                      </button>
                    </div>
                  ))}
                  
                  {selectedImages.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file)
                    return (
                      <div key={`local-${idx}`} className="relative aspect-square group rounded-xl overflow-hidden shadow-sm border border-primary/20 bg-primary/5">
                        <img src={previewUrl} alt="Local" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imageUrls.length + idx)}
                          className="absolute inset-x-0 bottom-0 bg-primary/80 text-white py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90 flex items-center justify-center"
                        >
                           <XIcon className="size-3 mr-1" /> Clear local
                        </button>
                      </div>
                    )
                  })}

                  {/* Empty Selection Dropzone if no images */}
                  {imageUrls.length === 0 && selectedImages.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-colors relative group">
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
                        <div className="size-12 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                           <UploadCloud className="size-6 text-primary" />
                        </div>
                        <p className="text-sm font-semibold">Select part media</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Files will be encrypted on submission</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Status Section */}
            <Card className="shadow-none border-muted-foreground/20 bg-muted/20">
              <CardHeader className="pb-3 border-b border-muted">
                <CardTitle className="flex items-center gap-2 text-md font-semibold">
                  Request Status
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <Select
                  defaultValue="published"
                  onValueChange={(val: any) => setValue('status', val)}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder={initialData?.status || "published"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">
                      Immediate Broadcast
                    </SelectItem>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "Broadcasting" sends your request to verified sellers instantly. Sellers can then bid with price and availability.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border-muted-foreground/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-semibold">Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                   <div className="size-1.5 rounded-full bg-primary mt-1 shrink-0" />
                   <p>Clear VIN plate photos help sellers identify OEM parts accurately.</p>
                </div>
                <div className="flex items-start gap-2">
                   <div className="size-1.5 rounded-full bg-primary mt-1 shrink-0" />
                   <p>Specify the condition (New/Used/Genunine) in the detailed description.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-muted">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 shadow-md font-semibold"
            disabled={isUploading || createRequest.isPending || updateRequest.isPending}
          >
            {(isUploading || createRequest.isPending || updateRequest.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? `Uploading ${uploadProgress}%` : 'Synchronizing...'}
              </>
            ) : isEditing ? 'Update Request' : 'Broadcast Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}


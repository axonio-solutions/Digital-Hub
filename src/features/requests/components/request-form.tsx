import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Camera, Car, Loader2, Plus } from 'lucide-react'
import type {User} from '@/lib/auth';
import type {
  CreateRequestInput} from '@/types/request-schemas';
import {
  createRequestSchema
} from '@/types/request-schemas'
import { createRequestServerFn } from '@/fn/requests'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useVehicles } from '@/features/garage/hooks/use-vehicles'
import { generateUploadUrlFn } from '@/server/upload/storage'
import { cn } from '@/lib/utils'
import { ImageSlider } from '@/components/ui/image-slider'
import { Progress } from '@/components/ui/progress'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

export function RequestPartForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  const buyerId = (user as any as User)?.id || ''

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useVehicles(buyerId)

  // Use Case Logic internally for images (transient state)
  const [selectedImages, setSelectedImages] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [garageMode, setGarageMode] = useState<string>('manual')

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema as any),
    defaultValues: {
      buyerId: buyerId,
      partName: '',
      vehicleBrand: '',
      modelYear: '',
      oemNumber: '',
      notes: '',
      imageUrls: [],
    },
  })

  // Sync buyerId when user loads
  if (buyerId && !form.getValues('buyerId')) {
    form.setValue('buyerId', buyerId)
  }

  const { mutate: createRequest, isPending: isSubmitting } = useMutation({
    mutationFn: async (values: CreateRequestInput) => {
      const res = await createRequestServerFn({ data: values })
      return res
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['requests'] })
        toast.success('Request Submitted!', {
          description: 'Sellers will begin sending quotes shortly.',
        })
        form.reset()
        setSelectedImages([])
        setGarageMode('manual')
        if (onSuccess) onSuccess()
      } else {
        toast.error('Submission Failed', {
          description:
            res.error || "We couldn't process your request. Please try again.",
        })
      }
    },
    onError: (error) => {
      console.error(error)
      toast.error('Submission Failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedImages((prev) => [...prev, ...newFiles])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: CreateRequestInput) {
    if (isUploading) return

    setIsUploading(true)
    setUploadProgress(0)
    const finalImageUrls: Array<string> = []

    try {
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i]
          const generateRes = await (generateUploadUrlFn as any)({
            data: { filename: file.name, contentType: file.type },
          })
          const path = generateRes.path
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

          const formData = new FormData()
          formData.append('file', file)

          const uploadRes = await fetch(
            `${supabaseUrl}/storage/v1/object/requests-photos/${path}`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${supabaseAnonKey}` },
              body: formData,
            },
          )

          if (uploadRes.ok) {
            finalImageUrls.push(
              `${supabaseUrl}/storage/v1/object/public/requests-photos/${path}`,
            )
          }
          
          setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100))
        }
      }

      // Final Submission with await to keep isUploading state
      await (createRequest as any).mutateAsync({
        ...values,
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      })
      
      // Artificial grace period to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(error)
      toast.error('Submission Failed', {
        description: 'An unexpected error occurred during the final sync.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onGarageSelect = (vehicleId: string) => {
    setGarageMode(vehicleId)
    if (vehicleId !== 'manual') {
      const vehicle = vehicles.find((v: any) => v.id === vehicleId)
      if (vehicle) {
        form.setValue('vehicleBrand', vehicle.make)
        form.setValue('modelYear', `${vehicle.model} - ${vehicle.year}`)
        if (vehicle.vin || vehicle.licensePlate) {
          const currentNotes = form.getValues('notes') || ''
          form.setValue(
            'notes',
            `${currentNotes}\n\n[Auto-attached: ${vehicle.vin ? `VIN: ${vehicle.vin}` : ''} ${vehicle.licensePlate ? `Plate: ${vehicle.licensePlate}` : ''}]`.trim(),
          )
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="partName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Part Name/Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Front Bumper, Brake Pads..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="oemNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OEM/Part Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 1J0 615 125 A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-full border border-dashed text-primary/80 border-border bg-secondary rounded-xl p-4 mb-2">
          <Label className="flex items-center gap-2 mb-3 text-primary">
            <Car className="h-4 w-4" /> Pick a vehicle from your Garage
          </Label>
          <Select
            value={garageMode}
            onValueChange={onGarageSelect}
            disabled={isLoadingVehicles}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a saved vehicle..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  🚘 {v.make} {v.model} ({v.year})
                </SelectItem>
              ))}
              <SelectItem
                value="manual"
                className="font-medium outline-dashed outline-1 outline-muted rounded-md mt-2"
              >
                ✍️ Enter details manually
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {garageMode === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <FormField
              control={form.control}
              name="vehicleBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vehicle Brand <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        'Audi',
                        'BMW',
                        'Chevrolet',
                        'Dacia',
                        'Ford',
                        'Hyundai',
                        'Kia',
                        'Mercedes-Benz',
                        'Nissan',
                        'Peugeot',
                        'Renault',
                        'Seat',
                        'Skoda',
                        'Toyota',
                        'Volkswagen',
                      ].map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Model & Year <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Golf 7 - 2016" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Media Upload (Layer 1 Component Logic) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Camera className="size-4" /> Media Attachments
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                High-quality photos speed up your quotes
              </p>
            </div>
            {selectedImages.length > 0 && !isUploading && (
               <div className="relative group/btn">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    onChange={handleImageChange}
                    disabled={isUploading || isSubmitting}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="h-8 rounded-lg px-3 font-black uppercase text-[10px] tracking-widest gap-2 bg-secondary/50 hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    <Plus className="size-3" /> Add More
                  </Button>
               </div>
            )}
          </div>

          <div className={cn(
            "relative min-h-[160px] rounded-[2rem] border-2 border-dashed border-border transition-all duration-500 overflow-hidden",
            selectedImages.length === 0 ? "bg-secondary/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/40 hover:border-primary/50" : "bg-muted/10 p-4 border-solid"
          )}>
            {selectedImages.length === 0 ? (
              <div className="relative w-full flex flex-col items-center">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleImageChange}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-border mb-4 group-hover/upload:scale-110 transition-transform duration-500">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight">Select Part Photos</h4>
                <p className="text-[10px] mt-1 text-muted-foreground font-black uppercase tracking-wider opacity-60">
                  Tap to browse or drop here
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-3/5 lg:w-2/3">
                  <ImageSlider 
                    images={selectedImages} 
                    onRemove={removeImage} 
                    isEditable={!isUploading && !isSubmitting}
                    aspectRatio="4/3"
                    className="shadow-2xl ring-4 ring-white dark:ring-slate-900 rounded-3xl"
                  />
                </div>
                
                <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col gap-4">
                   <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-border/50 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Hub</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight">
                          {selectedImages.length} Files
                        </span>
                      </div>
                      
                      {isUploading ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <Progress value={uploadProgress} showLabel variant="primary" className="h-2.5" />
                           <div className="flex flex-col gap-1 items-center justify-center pt-2">
                             <div className="flex items-center gap-2">
                               <div className="size-2 bg-primary rounded-full animate-ping" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Encrypting Assets</span>
                             </div>
                             <span className="text-[9px] font-bold text-slate-400/60 uppercase">Wait while we sync to storage</span>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                          <Camera className="size-8 mb-2" />
                          <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Submission</p>
                        </div>
                      )}
                   </div>

                   {!isUploading && (
                      <div className="relative group/btn w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleImageChange}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="w-full h-10 border-dashed border-2 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all hover:bg-secondary/50 active:scale-95"
                        >
                          <Plus className="size-4" /> Add More photos
                        </Button>
                      </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Need it urgent, etc..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isUploading || isSubmitting} className="bg-primary hover:bg-primary/90 font-black uppercase tracking-widest px-8">
            {isUploading || isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {isUploading ? `Uploading ${uploadProgress}%` : 'Submitting...'}
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

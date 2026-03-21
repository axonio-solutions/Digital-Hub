import { useState } from "react"
import { useForm } from "react-hook-form"
import { type User } from "@/lib/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createRequestSchema, CreateRequestInput } from "@/types/request-schemas"
import { createRequestServerFn } from "@/fn/requests"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useVehicles } from "@/features/garage/hooks/use-vehicles"
import { generateUploadUrlFn } from "@/features/upload/server/storage"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Plus, Loader2, Car, X } from "lucide-react"

export function RequestPartForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  const buyerId = (user as any as User)?.id || ""

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useVehicles(buyerId)

  // Use Case Logic internally for images (transient state)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [garageMode, setGarageMode] = useState<string>("manual")

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema as any),
    defaultValues: {
      buyerId: buyerId,
      partName: "",
      vehicleBrand: "",
      modelYear: "",
      oemNumber: "",
      notes: "",
      imageUrls: [],
    },
  })

  // Sync buyerId when user loads
  if (buyerId && !form.getValues("buyerId")) {
    form.setValue("buyerId", buyerId)
  }

  const { mutate: createRequest, isPending: isSubmitting } = useMutation({
    mutationFn: async (values: CreateRequestInput) => {
      const res = await createRequestServerFn({ data: values })
      return res
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["requests"] })
        toast.success("Request Submitted!", {
          description: "Sellers will begin sending quotes shortly."
        })
        form.reset()
        setSelectedImages([])
        setGarageMode("manual")
        if (onSuccess) onSuccess()
      } else {
        toast.error("Submission Failed", {
          description: res.error || "We couldn't process your request. Please try again."
        })
      }
    },
    onError: (error) => {
      console.error(error)
      toast.error("Submission Failed", {
        description: "An unexpected error occurred. Please try again."
      })
    }
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
    let finalImageUrls: string[] = []

    try {
      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          const generateRes = await (generateUploadUrlFn as any)({
            data: { filename: file.name, contentType: file.type }
          });
          const path = generateRes.path;
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const formData = new FormData();
          formData.append('file', file);

          const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/requests_media/${path}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${supabaseAnonKey}` },
            body: formData
          });

          if (uploadRes.ok) {
            finalImageUrls.push(`${supabaseUrl}/storage/v1/object/public/requests_media/${path}`);
          }
        }
      }

      // Final Submission
      createRequest({
        ...values,
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined
      })
    } catch (error) {
      toast.error("Media Upload Error")
    } finally {
      setIsUploading(false)
    }
  }

  const onGarageSelect = (vehicleId: string) => {
    setGarageMode(vehicleId)
    if (vehicleId !== "manual") {
      const vehicle = vehicles.find((v: any) => v.id === vehicleId)
      if (vehicle) {
        form.setValue("vehicleBrand", vehicle.make)
        form.setValue("modelYear", `${vehicle.model} - ${vehicle.year}`)
        if (vehicle.vin || vehicle.licensePlate) {
          const currentNotes = form.getValues("notes") || ""
          form.setValue("notes", `${currentNotes}\n\n[Auto-attached: ${vehicle.vin ? `VIN: ${vehicle.vin}` : ''} ${vehicle.licensePlate ? `Plate: ${vehicle.licensePlate}` : ''}]`.trim())
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
                <FormLabel>Part Name/Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Front Bumper, Brake Pads..." {...field} />
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

        <div className="col-span-full border border-dashed text-primary/80 border-primary/20 bg-primary/5 rounded-xl p-4 mb-2">
          <Label className="flex items-center gap-2 mb-3 text-primary">
            <Car className="h-4 w-4" /> Pick a vehicle from your Garage
          </Label>
          <Select value={garageMode} onValueChange={onGarageSelect} disabled={isLoadingVehicles}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a saved vehicle..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  🚘 {v.make} {v.model} ({v.year})
                </SelectItem>
              ))}
              <SelectItem value="manual" className="font-medium outline-dashed outline-1 outline-muted rounded-md mt-2">
                ✍️ Enter details manually
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {garageMode === "manual" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <FormField
              control={form.control}
              name="vehicleBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Brand <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Audi", "BMW", "Chevrolet", "Dacia", "Ford", "Hyundai", "Kia", "Mercedes-Benz", "Nissan", "Peugeot", "Renault", "Seat", "Skoda", "Toyota", "Volkswagen"].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
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
                  <FormLabel>Model & Year <span className="text-red-500">*</span></FormLabel>
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
        <div className="space-y-4 rounded-xl p-8 bg-muted/20 border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-sm">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Attach Photos</h3>
            <p className="mb-4 mt-2 text-sm text-balance text-muted-foreground">
              Upload photos of the broken part or the VIN to help sellers identify it faster.
            </p>
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleImageChange}
                disabled={isUploading || isSubmitting}
              />
              <Button variant="secondary" size="sm" type="button" className="pointer-events-none">
                <Plus className="mr-2 h-4 w-4" />
                Select Photos
              </Button>
            </div>
          </div>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative group aspect-square rounded-md overflow-hidden bg-background border shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Need it urgent, etc..." className="resize-none" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isUploading || isSubmitting}>
            {(isUploading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading media..." : "Submitting..."}
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

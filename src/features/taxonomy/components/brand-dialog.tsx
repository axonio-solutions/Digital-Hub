import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { brandSchema, type BrandInput } from '@/features/taxonomy/validations/taxonomy'
import { useCreateBrand, useUpdateBrand } from '../hooks/use-taxonomy'

interface Brand {
  id: string
  brand: string
  clusterOrigin: string
  clusterRegion: string
  status: 'active' | 'draft' | 'archived'
}

export function BrandDialog({
  open,
  onOpenChange,
  editingItem
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editingItem?: Brand | null
}) {
  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      brand: '',
      clusterOrigin: '',
      clusterRegion: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        brand: editingItem.brand,
        clusterOrigin: editingItem.clusterOrigin,
        clusterRegion: editingItem.clusterRegion,
        status: editingItem.status as any
      })
    } else {
      form.reset({
        brand: '',
        clusterOrigin: '',
        clusterRegion: '',
        status: 'active'
      })
    }
  }, [editingItem, form, open])

  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()

  const onSubmit = (values: BrandInput) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-space italic uppercase font-black text-2xl tracking-tighter">
            {editingItem ? 'Edit Brand' : 'Create Brand Cluster'}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium leading-relaxed">
            Define vehicle clusters and manufacturer specifications. This influences AI-driven demand forecasting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manufacturer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Hyundai" {...field} className="h-11 font-bold text-xs rounded-xl" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cluster Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., South Korea, Japan, Germany..." {...field} className="h-11 font-bold text-xs rounded-xl" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cluster Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Asian, European, Mercosur..." {...field} className="h-11 font-bold text-xs rounded-xl" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxonomy Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 font-bold text-xs rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs font-bold">Active</SelectItem>
                      <SelectItem value="draft" className="text-xs font-bold">Draft</SelectItem>
                      <SelectItem value="archived" className="text-xs font-bold">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {editingItem ? 'Update Cluster' : 'Deploy Cluster'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

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
import { categorySchema, type CategoryInput } from '@/features/taxonomy/validations/taxonomy'
import { useCreateCategory, useUpdateCategory } from '../hooks/use-taxonomy'

interface Category {
  id: string
  name: string
  description: string | null
  status: 'active' | 'draft' | 'archived'
}

export function CategoryDialog({
  open,
  onOpenChange,
  editingItem
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editingItem?: Category | null
}) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      description: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        description: editingItem.description || '',
        status: editingItem.status as any
      })
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'active'
      })
    }
  }, [editingItem, form, open])

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const onSubmit = (values: CategoryInput) => {
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
            {editingItem ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium leading-relaxed">
            Configure parts taxonomy metadata. Precise labeling ensures high-fidelity demand matching.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Label Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Hydraulics" {...field} className="h-11 font-bold text-xs rounded-xl" />
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Technical specs, sub-components..." {...field} value={field.value || ''} className="h-11 font-bold text-xs rounded-xl" />
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
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {editingItem ? 'Update Category' : 'Deploy Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

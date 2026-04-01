import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import {
  createRequestSchema,
  type CreateRequestInput,
} from '@/types/request-schemas'
import { useUpdateRequest } from '../hooks/use-requests'
import { Modal } from '@/components/ui/modal'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface EditRequestDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRequestDialog({
  request,
  open,
  onOpenChange,
}: EditRequestDialogProps) {
  const { mutate: updateRequest, isPending: isUpdating } = useUpdateRequest()

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema as any),
    defaultValues: {
      buyerId: request.buyerId,
      partName: request.partName || '',
      vehicleBrand: request.vehicleBrand || '',
      modelYear: request.modelYear || '',
      oemNumber: request.oemNumber || '',
      notes: request.notes || '',
      imageUrls: request.imageUrls || [],
    },
  })

  const onSubmit = (values: CreateRequestInput) => {
    updateRequest(
      { id: request.id, payload: values },
      {
        onSuccess: () => {
          toast.success('Request updated successfully')
          onOpenChange(false)
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to update request')
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Request"
      description="Modify the details of your request to help sellers provide more accurate quotes."
      className="sm:max-w-[600px]"
      contentClassName="p-0"
    >
      <div className="p-8 md:p-12 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Part Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">OEM Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes/Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      {...field}
                      className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Modal>
  )
}

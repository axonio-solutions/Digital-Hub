'use client'

import {
  Activity,
  Calendar,
  Car,
  MapPin,
  FileText,
  Database,
  Fingerprint
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ImageSlider } from '@/components/ui/image-slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface RequestDetailsDialogProps {
  request: any | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  footer?: React.ReactNode
}

export function RequestDetailsDialog({
  request,
  isOpen,
  onOpenChange,
  footer,
}: RequestDetailsDialogProps) {
  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Technical specifications and buyer notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border bg-muted">
              <ImageSlider
                images={request?.imageUrls || []}
                aspectRatio="video"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Car className="h-4 w-4" /> Vehicle Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Brand</div>
                  <div className="font-semibold">{request?.vehicleBrand}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Part Category</div>
                  <div className="font-semibold">{request?.category?.name || request?.category || 'General'}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Model Year</div>
                  <div className="font-semibold">{request?.modelYear}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Part Specifics
              </h4>
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/10">
                <div className="text-[10px] text-primary uppercase font-bold mb-1">OEM / Part Number</div>
                <code className="text-lg font-mono font-bold tracking-tight">
                  {request?.oemNumber || 'Not specified'}
                </code>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50">
                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Buyer Notes</div>
                <p className="text-sm italic leading-relaxed text-slate-600">
                  "{request?.notes || request?.description || 'No specific notes provided.'}"
                </p>
              </div>
            </div>

            <Card className="bg-muted/30 border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Database className="h-3 w-3" /> Metadata Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4 text-[11px] font-medium">
                <div className="flex justify-between border-b border-dashed pb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Fingerprint className="h-3 w-3" /> Network ID</span>
                  <span className="font-mono">#{request?.id?.substring(0, 12)}</span>
                </div>
                <div className="flex justify-between border-b border-dashed pb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Broadcasted</span>
                  <span>{request?.createdAt ? format(new Date(request.createdAt), 'PPp') : 'N/A'}</span>
                </div>
                {request?.wilaya && (
                  <div className="flex justify-between border-b border-dashed pb-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Regional Origin</span>
                    <span>{request.wilaya}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-dashed pb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="h-3 w-3" /> Market Traction</span>
                  <span>{request?.quotes?.length || 0} Responses</span>
                </div>
              </CardContent>
            </Card>

            {footer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

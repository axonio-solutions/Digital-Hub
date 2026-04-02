'use client'

import { formatDistanceToNow } from 'date-fns'
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone,
  XCircle,
  RotateCcw,
  Undo2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface QuoteCardProps {
  quote: any
  isRequestOpen: boolean
  onAccept: (quoteId: string) => void
  onReject: (quoteId: string) => void
  onUnreject: (quoteId: string) => void
  onRevoke: (quoteId: string) => void
  onContact: (seller: any) => void
  isAccepting?: boolean
  isRejecting?: boolean
  isUnrejecting?: boolean
  isRevoking?: boolean
}

export function QuoteCard({
  quote,
  isRequestOpen,
  onAccept,
  onReject,
  onUnreject,
  onRevoke,
  onContact,
  isAccepting = false,
  isRejecting = false,
  isUnrejecting = false,
  isRevoking = false,
}: QuoteCardProps) {
  const isAccepted = quote.status === 'accepted'
  const isRejected = quote.status === 'rejected'
  const isPending = !quote.status || quote.status === 'pending'

  return (
    <div className={`group bg-white dark:bg-card rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
      isAccepted ? 'border-primary/50 bg-primary/[0.02] shadow-md shadow-primary/5' : 
      isRejected ? 'opacity-60 grayscale-[0.5] border-gray-100 dark:border-gray-800' :
      'border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-primary/30'
    }`}>
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Seller Avatar/Icon Section */}
        <div className="flex-shrink-0">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl border shadow-inner transition-colors ${
            isAccepted ? 'bg-primary text-white border-primary' : 'bg-primary/5 dark:bg-primary/10 text-primary border-primary/10'
          }`}>
            {quote.seller?.name?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>

        {/* Offer Content Section */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight truncate">
                   {quote.seller?.storeName || quote.seller?.name || 'Authorized Seller'}
                </h3>
                {isAccepted && <CheckCircle2 className="size-4 text-primary fill-primary/10" />}
                {isRejected && <Badge variant="secondary" className="text-[9px] uppercase h-4 px-1.5 font-bold">Rejected</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground opacity-80">
                  <MapPin className="size-3.5 text-primary" />
                  <span className="truncate max-w-[200px]">
                    {quote.seller?.address || quote.seller?.city || quote.seller?.wilaya || 'Algeria'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground opacity-80">
                  <Clock className="size-3.5 text-primary" />
                  <span>{formatDistanceToNow(new Date(quote.createdAt))} ago</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end shrink-0">
              <div className={`text-2xl font-black tracking-tighter ${isAccepted ? 'text-primary' : 'text-foreground/90'}`}>
                {quote.price.toLocaleString()} <span className="text-[10px] uppercase align-top mt-1 inline-block ms-0.5">DZD</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-0 px-1.5 border-primary/20 text-muted-foreground mt-1">
                {quote.condition || 'Used - Clean'}
              </Badge>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-5 border shadow-inner transition-colors ${
            isAccepted ? 'bg-primary/5 border-primary/10' : 'bg-secondary/50 dark:bg-gray-800/40 border-border group-hover:bg-white dark:group-hover:bg-gray-800/60'
          }`}>
            <p className="text-sm text-foreground dark:text-gray-300 italic font-medium leading-relaxed">
              "{quote.notes || 'Hi! We have this exact part in stock. Quality checked and ready for dispatch.'}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end pt-2">
            {isAccepted ? (
              <>
                 <Button
                  onClick={() => onRevoke(quote.id)}
                  disabled={isRevoking}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none h-10 px-4 gap-2 font-black uppercase text-[10px] tracking-widest border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  <Undo2 className="size-3.5" />
                  {isRevoking ? 'Revoking...' : 'Revoke Acceptance'}
                </Button>
                <Button
                  onClick={() => onContact(quote.seller)}
                  size="sm"
                  className="flex-1 sm:flex-none h-10 px-6 gap-2 font-black uppercase text-[11px] tracking-widest bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 transition-all active:scale-95"
                >
                  <Phone className="size-4" />
                  Contact Seller
                </Button>
              </>
            ) : isRejected ? (
              <Button
                onClick={() => onUnreject(quote.id)}
                disabled={isUnrejecting}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-10 px-6 gap-2 font-black uppercase text-[11px] tracking-widest border-primary/20 text-primary hover:bg-primary/5 transition-all"
              >
                <RotateCcw className="size-4" />
                {isUnrejecting ? 'Restoring...' : 'Un-reject Offer'}
              </Button>
            ) : isPending && isRequestOpen ? (
              <>
                <Button
                  onClick={() => onReject(quote.id)}
                  disabled={isRejecting}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none h-10 px-4 gap-2 font-black uppercase text-[10px] tracking-widest border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                >
                  <XCircle className="size-3.5" />
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => onAccept(quote.id)}
                  disabled={isAccepting}
                  size="sm"
                  className="flex-1 sm:flex-none h-10 px-6 gap-2 font-black uppercase text-[11px] tracking-widest bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 transition-all active:scale-95"
                >
                  <CheckCircle2 className="size-4" />
                  {isAccepting ? 'Accepting...' : 'Accept Offer'}
                </Button>
              </>
            ) : null}
            
            {/* Show contact button if request is NOT open and this IS NOT the accepted quote (e.g. historical view) */}
            {!isRequestOpen && !isAccepted && !isRejected && (
               <Button
                disabled
                variant="ghost"
                 size="sm"
                 className="flex-1 sm:flex-none h-10 px-6 gap-2 font-black uppercase text-[11px] tracking-widest opacity-50 cursor-not-allowed"
               >
                 Request Closed
               </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

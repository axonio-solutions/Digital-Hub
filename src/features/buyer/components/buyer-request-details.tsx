import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Tag,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  useCancelRequest,
  useDeleteRequest,
  useReopenRequest,
  useRequestDetails,
} from '@/features/requests/hooks/use-requests'
import {
  useAcceptQuote,
  useRejectQuote,
  useRevokeQuote,
  useUnrejectQuote,
} from '@/features/quotes/hooks/use-quotes'
import { Button } from '@/components/ui/button'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EditRequestDialog } from '@/features/requests/components/edit-request-dialog'
import { QuoteList } from '@/features/quotes/components/quote-list'

export function BuyerRequestDetails() {
  const { t } = useTranslation(['requests/details', 'requests/list'])
  const { requestId } = useParams({ from: '/_authed/dashboard/requests/$requestId' })
  const navigate = useNavigate()
  const { data: request, isLoading, error } = useRequestDetails(requestId)
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequest()
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest()
  const { mutate: reopenRequest, isPending: isReopening } = useReopenRequest()

  const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote()
  const { mutate: rejectQuote, isPending: isRejecting } = useRejectQuote()
  const { mutate: unrejectQuote, isPending: isUnrejecting } = useUnrejectQuote()
  const { mutate: revokeQuote, isPending: isRevoking } = useRevokeQuote()

  const [processingQuoteId, setProcessingQuoteId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactingSeller, setContactingSeller] = useState<any>(null)

  const handleCancel = () => cancelRequest(requestId, { onSuccess: () => toast.success('Request closed successfully'), onError: (err: any) => toast.error(err.message || 'Failed to close request') })
  const handleReopen = () => reopenRequest(requestId, { onSuccess: () => toast.success('Request reopened successfully'), onError: (err: any) => toast.error(err.message || 'Failed to reopen request') })
  const handleDelete = () => deleteRequest(requestId, { onSuccess: () => { toast.success('Request deleted successfully'); navigate({ to: '/dashboard/requests' }) }, onError: (err: any) => toast.error(err.message || 'Failed to delete request') })
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard') }

  const handleAccept = (quoteId: string) => { setProcessingQuoteId(quoteId); acceptQuote({ quoteId, requestId }, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message || 'Failed to accept quote'); setProcessingQuoteId(null) } }) }
  const handleReject = (quoteId: string) => { setProcessingQuoteId(quoteId); rejectQuote(quoteId, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message || 'Failed to reject offer'); setProcessingQuoteId(null) } }) }
  const handleUnreject = (quoteId: string) => { setProcessingQuoteId(quoteId); unrejectQuote(quoteId, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message || 'Failed to restore offer'); setProcessingQuoteId(null) } }) }
  const handleRevoke = (quoteId: string) => { setProcessingQuoteId(quoteId); revokeQuote({ quoteId, requestId }, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message || 'Failed to revoke acceptance'); setProcessingQuoteId(null) } }) }

  const handleContactWhatsApp = (seller: any) => {
    const number = seller?.whatsappNumber || seller?.phoneNumber
    if (!number) { toast.error('No WhatsApp number available'); return }
    const cleanNumber = number.replace(/\D/g, '')
    const message = encodeURIComponent(`Hi ${seller.storeName || seller.name}, I'm interested in your offer for "${request?.partName || 'part'}".`)
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank')
  }
  const handleContactCall = (phoneNumber?: string) => {
    if (!phoneNumber) { toast.error('Phone number not available'); return }
    window.location.href = `tel:${phoneNumber}`
  }

  if (isLoading) return <RequestDetailsSkeleton />
  if (error || !request) return <ErrorState t={t} />

  const hasImage = request.imageUrls && request.imageUrls.length > 0
  const imageUrl = hasImage && request.imageUrls ? request.imageUrls[0] : null

  return (
    <div className="flex-1 flex flex-col gap-0 w-full pb-20 lg:pb-8">

      {/* HERO IMAGE — full-bleed on mobile */}
      {hasImage && imageUrl ? (
        <div className="relative w-full aspect-video lg:aspect-[4/3] lg:rounded-2xl lg:overflow-hidden bg-muted/50">
          <img src={imageUrl} alt={request.partName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between lg:hidden">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-white hover:bg-black/40" onClick={() => window.history.back()}>
              <ArrowLeft className="size-3.5" /> Back
            </Button>
            <Button variant="ghost" size="icon" className="size-9 rounded-xl bg-black/20 backdrop-blur-sm text-white hover:bg-black/40" onClick={handleShare}>
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-video lg:aspect-[4/3] lg:rounded-2xl lg:overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center border border-border shadow-sm">
            <Calendar className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between lg:hidden">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-white hover:bg-black/40" onClick={() => window.history.back()}>
              <ArrowLeft className="size-3.5" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 px-3 sm:px-4 lg:px-0 lg:pr-0 pt-4 lg:pt-0">

        {/* LEFT — sticky sidebar */}
        <aside className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:pt-4">

          {/* Desktop back button */}
          <div className="hidden lg:block">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => window.history.back()}>
              <ArrowLeft className="size-3.5" /> {t('actions.back_to_list')}
            </Button>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {request.brand?.brand || request.vehicleBrand}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {request.modelYear}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-tight uppercase">
              {request.partName}
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <GlowingBadge
                variant={request.status === 'open' ? 'success' : 'neutral'}
                pulse={request.status === 'open'}
                className="px-2.5 py-1"
              >
                {request.status === 'open' ? 'Open' : request.status === 'fulfilled' ? 'Fulfilled' : request.status}
              </GlowingBadge>

              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-bold" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="size-3" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-bold" onClick={handleShare}>
                <Share2 className="size-3" /> Copy link
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-bold text-destructive hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="size-3" /> Delete
              </Button>
            </div>
          </div>

          {/* Metadata card */}
          <div className="bg-muted/40 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('columns.posted', { ns: 'requests/list' })}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="text-sm font-bold text-foreground">
                    {request.brand?.clusterRegion || t('labels.general')}
                  </p>
                </div>
              </div>
              {request.category?.name && (
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                    <p className="text-sm font-bold text-foreground capitalize">{request.category.name}</p>
                  </div>
                </div>
              )}
            </div>

            {request.notes && (
              <>
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{request.notes}</p>
                </div>
              </>
            )}

            {/* Inline Close/Reopen for desktop */}
            <div className="hidden lg:block pt-2 border-t border-border/50">
              {request.status === 'open' ? (
                <Button onClick={handleCancel} disabled={isCancelling} variant="outline" className="w-full h-10 rounded-xl gap-2 text-sm font-bold">
                  <CheckCircle2 className="size-4 text-green-600" />
                  {isCancelling ? 'Closing...' : 'Close Request'}
                </Button>
              ) : (
                <Button onClick={handleReopen} disabled={isReopening} variant="outline" className="w-full h-10 rounded-xl gap-2 text-sm font-bold">
                  <Clock className="size-4 text-primary" />
                  {isReopening ? 'Reopening...' : 'Reopen Request'}
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT — quotes */}
        <section className="lg:col-span-7 py-4 lg:py-0 px-3 sm:px-4 lg:px-0">
          <QuoteList
            quotes={request.quotes}
            isRequestOpen={request.status === 'open'}
            onAccept={handleAccept}
            onReject={handleReject}
            onUnreject={handleUnreject}
            onRevoke={handleRevoke}
            onContact={setContactingSeller}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
            isUnrejecting={isUnrejecting}
            isRevoking={isRevoking}
            processingQuoteId={processingQuoteId}
          />
        </section>
      </div>

      {/* Fixed bottom CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-3 lg:hidden" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center gap-2">
          {request.status === 'open' ? (
            <>
              <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" className="h-12 rounded-xl gap-2 flex-1 text-sm font-bold">
                <Edit className="size-4" /> Edit
              </Button>
              <Button onClick={handleCancel} disabled={isCancelling} className="h-12 rounded-xl gap-2 flex-1 text-sm font-bold">
                <CheckCircle2 className="size-4" />
                {isCancelling ? 'Closing...' : 'Close'}
              </Button>
            </>
          ) : (
            <Button onClick={handleReopen} disabled={isReopening} className="h-12 rounded-xl gap-2 w-full text-sm font-bold">
              <Clock className="size-4" />
              {isReopening ? 'Reopening...' : 'Reopen Request'}
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <EditRequestDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} request={request} />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">{t('dialogs.delete.title')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('dialogs.delete.description', { ns: 'requests/list' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="h-10 rounded-xl text-sm">Cancel</Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="h-10 rounded-xl text-sm bg-destructive hover:bg-destructive/90">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!contactingSeller} onOpenChange={(open) => !open && setContactingSeller(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">{t('contact.title')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('contact.connect_desc', { name: contactingSeller?.storeName || contactingSeller?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted/40 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                  {(contactingSeller?.storeName || contactingSeller?.name)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-sm">{contactingSeller?.storeName || contactingSeller?.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />{contactingSeller?.wilaya || 'Algeria'}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => handleContactWhatsApp(contactingSeller)} className="h-12 rounded-xl gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold">
              <MessageCircle className="size-5 fill-current" /> WhatsApp
            </Button>
            <Button onClick={() => handleContactCall(contactingSeller?.phoneNumber)} variant="outline" className="h-12 rounded-xl gap-2 w-full font-bold">
              <Phone className="size-4" /> Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequestDetailsSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-0 w-full pb-20 lg:pb-8">
      <div className="relative w-full aspect-video lg:aspect-[4/3] lg:rounded-2xl lg:overflow-hidden bg-muted animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 px-3 sm:px-4 lg:px-0 pt-4">
        <aside className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="h-9 w-24 rounded-xl hidden lg:block" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-8 w-72 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </aside>
        <section className="lg:col-span-7 py-4 lg:py-0 px-3 sm:px-4 lg:px-0 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </section>
      </div>
    </div>
  )
}

function ErrorState({ t }: { t: any }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4">
      <div className="size-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center">
        <Calendar className="size-10 text-destructive/50" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-black tracking-tight">
          {t('errors.not_found', { defaultValue: 'Request Not Found' })}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t('errors.not_found_desc', { defaultValue: "We couldn't find the request you're looking for." })}
        </p>
      </div>
      <Link to="/dashboard/requests">
        <Button variant="outline" size="sm" className="h-10 rounded-xl">{t('actions.back_to_list')}</Button>
      </Link>
    </div>
  )
}

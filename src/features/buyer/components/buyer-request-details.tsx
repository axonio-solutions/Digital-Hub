import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  MapPin,
  MessageCircle,
  MessageSquare,
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

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <Calendar className="size-10 text-muted-foreground/30" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[4/3] w-full">
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="relative group aspect-[4/3] w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <img src={img} alt={`${alt} - ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))}
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight className="size-4" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`size-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

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

  const handleCancel = () => cancelRequest(requestId, { onSuccess: () => toast.success('Request closed'), onError: (err: any) => toast.error(err.message) })
  const handleReopen = () => reopenRequest(requestId, { onSuccess: () => toast.success('Request reopened'), onError: (err: any) => toast.error(err.message) })
  const handleDelete = () => deleteRequest(requestId, { onSuccess: () => { toast.success('Request deleted'); navigate({ to: '/dashboard/requests' }) }, onError: (err: any) => toast.error(err.message) })
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied') }

  const handleAccept = (quoteId: string) => { setProcessingQuoteId(quoteId); acceptQuote({ quoteId, requestId }, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message); setProcessingQuoteId(null) } }) }
  const handleReject = (quoteId: string) => { setProcessingQuoteId(quoteId); rejectQuote(quoteId, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message); setProcessingQuoteId(null) } }) }
  const handleUnreject = (quoteId: string) => { setProcessingQuoteId(quoteId); unrejectQuote(quoteId, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message); setProcessingQuoteId(null) } }) }
  const handleRevoke = (quoteId: string) => { setProcessingQuoteId(quoteId); revokeQuote({ quoteId, requestId }, { onSuccess: () => setProcessingQuoteId(null), onError: (err: any) => { toast.error(err.message); setProcessingQuoteId(null) } }) }

  const handleContactWhatsApp = (seller: any) => {
    const number = seller?.whatsappNumber || seller?.phoneNumber
    if (!number) { toast.error('No WhatsApp number'); return }
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${seller.storeName || seller.name}, I'm interested in your offer for "${request?.partName || 'part'}".`)}`, '_blank')
  }
  const handleContactCall = (phoneNumber?: string) => {
    if (!phoneNumber) { toast.error('Phone number not available'); return }
    window.location.href = `tel:${phoneNumber}`
  }

  if (isLoading) return <DetailsSkeleton />
  if (error || !request) return <ErrorView t={t} />

  const quotesCount = request.quotes.length || 0
  const brandName = request.brand?.brand || request.vehicleBrand || ''
  const region = request.brand?.clusterRegion || ''
  const category = request.category?.name || ''
  const postedDate = new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const isOpen = request.status === 'open'

  const sidebarContent = (
    <>
      {/* Image card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
        <ImageSlider images={request.imageUrls || []} alt={request.partName} />
      </div>

      {/* Brand + Year */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <div className="size-5 rounded bg-muted flex items-center justify-center shrink-0 border border-border/50">
          {request.brand?.imageUrl ? (
            <img src={request.brand.imageUrl} alt="" className="size-3.5 object-contain" />
          ) : (
            <span className="text-[8px] font-bold text-muted-foreground">{brandName.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span>{brandName}</span>
        {request.modelYear && <><span className="text-border">·</span><span>{request.modelYear}</span></>}
      </div>

      {/* Part Name */}
      <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-tight uppercase">
        {request.partName}
      </h1>

      {/* Status + Offer count */}
      <div className="flex items-center gap-3">
        <GlowingBadge
          variant={isOpen ? 'success' : 'neutral'}
          pulse={isOpen}
          className="px-2.5 py-1"
        >
          {isOpen ? 'Open' : request.status}
        </GlowingBadge>
        {isOpen && quotesCount > 0 && (
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <MessageSquare className="size-3 text-primary" />
            {quotesCount} {quotesCount === 1 ? 'offer' : 'offers'}
          </span>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="size-3.5" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-xs font-bold hover:bg-accent"
          onClick={handleShare}
        >
          <Share2 className="size-3.5" /> Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-xs font-bold hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>

      {/* Separator */}
      <div className="border-t border-border/50" />

      {/* Info rows */}
      <div className="space-y-0">
        <InfoRow icon={Calendar} label={t('columns.posted', { ns: 'requests/list' })} value={postedDate} />
        {region && <InfoRow icon={MapPin} label="Location" value={region} />}
        {category && <InfoRow icon={Tag} label="Category" value={category} />}
        {request.notes && <InfoRow icon={MessageSquare} label="Description" value={request.notes} />}
      </div>

      {/* Desktop Close/Reopen */}
      <div className="hidden lg:block pt-3">
        {isOpen ? (
          <Button onClick={handleCancel} disabled={isCancelling} variant="outline" className="w-full h-11 rounded-xl gap-2 text-sm font-bold">
            <CheckCircle2 className="size-4 text-green-600" />
            {isCancelling ? 'Closing...' : 'Close Request'}
          </Button>
        ) : (
          <Button onClick={handleReopen} disabled={isReopening} variant="outline" className="w-full h-11 rounded-xl gap-2 text-sm font-bold">
            <Clock className="size-4 text-primary" />
            {isReopening ? 'Reopening...' : 'Reopen Request'}
          </Button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex-1 flex flex-col w-full pb-20 lg:pb-8">

      {/* TOP NAV */}
      <div className="flex items-center px-3 py-2">
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl text-sm font-bold" onClick={() => window.history.back()}>
          <ArrowLeft className="size-4" />
          {t('actions.back_to_list')}
        </Button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 px-3 sm:px-4 lg:px-0">

        {/* LEFT — sidebar (desktop: sticky) */}
        <aside className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {sidebarContent}
        </aside>

        {/* RIGHT — quotes */}
        <section className="lg:col-span-7">
          <QuoteList
            quotes={request.quotes}
            isRequestOpen={isOpen}
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

      {/* FIXED BOTTOM CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-3 py-3 lg:hidden" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        {isOpen ? (
          <Button onClick={handleCancel} disabled={isCancelling} className="w-full h-12 rounded-xl gap-2 text-sm font-bold shadow-lg shadow-primary/20">
            <CheckCircle2 className="size-4" />
            {isCancelling ? 'Closing...' : 'Close Request'}
          </Button>
        ) : (
          <Button onClick={handleReopen} disabled={isReopening} className="w-full h-12 rounded-xl gap-2 text-sm font-bold">
            <Clock className="size-4" />
            {isReopening ? 'Reopening...' : 'Reopen Request'}
          </Button>
        )}
      </div>

      {/* DIALOGS */}
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
            <div className="bg-muted/40 rounded-xl p-4 flex items-center gap-3">
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

function DetailsSkeleton() {
  return (
    <div className="flex-1 flex flex-col w-full pb-20 lg:pb-8">
      <div className="flex items-center px-3 py-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 px-3 sm:px-4 lg:px-0">
        <aside className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-8 w-72 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16 rounded-xl" />
            <Skeleton className="h-9 w-16 rounded-xl" />
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </aside>
        <section className="lg:col-span-7 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </section>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-3 py-3 lg:hidden">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

function ErrorView({ t }: { t: any }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4">
      <div className="size-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center">
        <Calendar className="size-10 text-destructive/50" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-black tracking-tight">{t('errors.not_found', { defaultValue: 'Request Not Found' })}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">{t('errors.not_found_desc', { defaultValue: "We couldn't find the request you're looking for." })}</p>
      </div>
      <Link to="/dashboard/requests">
        <Button variant="outline" size="sm" className="h-10 rounded-xl">{t('actions.back_to_list')}</Button>
      </Link>
    </div>
  )
}

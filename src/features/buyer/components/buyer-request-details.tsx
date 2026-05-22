import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCcw,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useCancelRequest,
  useDeleteRequest,
  useReopenRequest,
  useRequestDetails,
} from '@/features/requests/hooks/use-requests'
import {
  useAcceptQuote,
  useFulfillRequest,
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
import { ActionConfirmDialog } from '@/features/buyer/components/action-confirm-dialog'
import { EditRequestDialog } from '@/features/requests/components/edit-request-dialog'
import { QuoteList } from '@/features/quotes/components/quote-list'
import { CategoryDisplay } from '@/components/ui/category-display'
import { tCategory } from '@/utils/category-utils'

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function ImageSlider({ images, alt }: { images: Array<string>; alt: string }) {
  const { t, i18n } = useTranslation(['requests/details', 'requests/list'])
  const isRtl = i18n.dir() === 'rtl'
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
        style={{
          transform: `translateX(${isRtl ? '' : '-'}${currentIndex * 100}%)`,
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <img
              src={img}
              alt={`${alt} - ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={() =>
          setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))
        }
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
            aria-label={t('contact.go_to_slide', { index: idx + 1 })}
          />
        ))}
      </div>
    </div>
  )
}

export function BuyerRequestDetails() {
  const { t, i18n } = useTranslation(['requests/details', 'requests/list'])
  const isRtl = i18n.dir() === 'rtl'
  const { requestId } = useParams({
    from: '/_authed/dashboard/requests/$requestId',
  })
  const navigate = useNavigate()
  const { data: request, isLoading, error } = useRequestDetails(requestId)
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequest()
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest()
  const { mutate: reopenRequest, isPending: isReopening } = useReopenRequest()

  const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote()
  const { mutate: rejectQuote, isPending: isRejecting } = useRejectQuote()
  const { mutate: unrejectQuote, isPending: isUnrejecting } = useUnrejectQuote()
  const { mutate: revokeQuote, isPending: isRevoking } = useRevokeQuote()
  const { mutate: fulfillRequest, isPending: isFulfilling } =
    useFulfillRequest()

  const [processingQuoteId, setProcessingQuoteId] = useState<string | null>(
    null,
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactingSeller, setContactingSeller] = useState<any>(null)

  const { toast } = useToast('requests/details')

  const handleCancel = () =>
    cancelRequest(requestId, {
      onSuccess: () => toast.success('toasts.request_closed'),
      onError: (err: any) =>
        toast.error('toasts.error', { error: err.message }),
    })

  const handleReopen = () =>
    reopenRequest(requestId, {
      onSuccess: () => toast.success('toasts.request_reopened'),
      onError: (err: any) =>
        toast.error('toasts.error', { error: err.message }),
    })

  const handleDelete = () =>
    deleteRequest(requestId, {
      onSuccess: () => {
        toast.success('toasts.request_deleted')
        navigate({ to: '/dashboard/requests' })
      },
      onError: (err: any) =>
        toast.error('toasts.error', { error: err.message }),
    })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('toasts.link_copied')
  }

  const handleAccept = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    acceptQuote(quoteId, {
      onSuccess: () => {
        toast.success('toasts.offer_accepted')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error('toasts.error', { error: err.message })
        setProcessingQuoteId(null)
      },
    })
  }

  const handleReject = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    rejectQuote(quoteId, {
      onSuccess: () => {
        toast.success('toasts.offer_declined')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error('toasts.error', { error: err.message })
        setProcessingQuoteId(null)
      },
    })
  }

  const handleUnreject = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    unrejectQuote(quoteId, {
      onSuccess: () => {
        toast.success('toasts.offer_restored')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error('toasts.error', { error: err.message })
        setProcessingQuoteId(null)
      },
    })
  }

  const handleRevoke = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    revokeQuote(quoteId, {
      onSuccess: () => {
        toast.success('toasts.acceptance_revoked')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error('toasts.error', { error: err.message })
        setProcessingQuoteId(null)
      },
    })
  }

  const handleFulfill = () => {
    fulfillRequest(requestId, {
      onSuccess: () => toast.success('toasts.request_fulfilled'),
      onError: (err: any) =>
        toast.error('toasts.error', { error: err.message }),
    })
  }

  const handleContactWhatsApp = (seller: any) => {
    const number = seller?.whatsappNumber || seller?.phoneNumber
    if (!number) {
      toast.error('toasts.no_whatsapp')
      return
    }
    window.open(
      `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(t('contact.whatsapp_message', { name: seller.storeName || seller.name, part: request?.partName || 'part' }))}`,
      '_blank',
    )
  }
  const handleContactCall = (phoneNumber?: string) => {
    if (!phoneNumber) {
      toast.error('toasts.phone_unavailable')
      return
    }
    window.location.href = `tel:${phoneNumber}`
  }

  if (isLoading) return <DetailsSkeleton />
  if (error || !request) return <ErrorView t={t} />

  const quotesCount = request.quotes.length || 0
  const brandName = request.brand?.brand || request.vehicleBrand || ''
  const region = request.brand?.clusterRegion || ''
  const categoryName = request.category?.name || (request.category as any) || ''
  const postedDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const isOpen = request.status === 'open'

  const sidebarContent = (
    <>
      {/* Image card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
        <ImageSlider images={request.imageUrls || []} alt={request.partName} />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          <GlowingBadge
            variant={isOpen ? 'success' : 'neutral'}
            pulse={isOpen}
            className="px-2.5 py-1 shadow-lg"
          >
            {isOpen
              ? t('labels.status_open')
              : t(`labels.status_${request.status}`, {
                  defaultValue: request.status,
                })}
          </GlowingBadge>
          {isOpen && quotesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-bold text-foreground shadow-lg">
              <MessageSquare className="size-3 text-primary" />
              {t('quotes.count', { count: quotesCount })}
            </span>
          )}
        </div>
      </div>

      {/* Brand + Year */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <div className="size-5 rounded bg-muted flex items-center justify-center shrink-0 border border-border/50">
          {request.brand?.imageUrl ? (
            <img
              src={request.brand.imageUrl}
              alt=""
              className="size-3.5 object-contain"
            />
          ) : (
            <span className="text-[8px] font-bold text-muted-foreground">
              {brandName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span>{brandName}</span>
        {request.modelYear && (
          <>
            <Car className="size-3.5" />
            <span>{request.modelYear}</span>
          </>
        )}
      </div>

      {/* Part Name */}
      <h1
        className="text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-tight uppercase break-words"
        title={request.partName}
      >
        {request.partName}
      </h1>

      {/* Actions row — hidden on mobile, shown on desktop in sidebar */}
      <div className="hidden lg:flex items-center gap-3">
        {isOpen ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              disabled={isEditDialogOpen}
              onClick={() => setIsEditDialogOpen(true)}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium"
            >
              <Edit className="size-4" />
              {t('actions.edit')}
            </Button>
            {request.quotes?.some((q: any) => q.status === 'accepted') && (
              <Button
                variant="default"
                disabled={isFulfilling}
                onClick={handleFulfill}
                className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isFulfilling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {t('actions.mark_fulfilled')}
              </Button>
            )}
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={handleCancel}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
            >
              {isCancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              {t('actions.close_request_btn')}
            </Button>
          </div>
        ) : request.status === 'cancelled' ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              disabled={isEditDialogOpen}
              onClick={() => setIsEditDialogOpen(true)}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium"
            >
              <Edit className="size-4" />
              {t('actions.edit')}
            </Button>
            <Button
              variant="outline"
              disabled={isReopening}
              onClick={handleReopen}
              className="flex-1 gap-1.5 h-10 px-3 rounded-lg text-sm font-medium border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              {isReopening ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              {t('actions.reopen_request_btn')}
            </Button>
          </div>
        ) : null}
        {request.status !== 'fulfilled' && (
          <Button
            variant="outline"
            size="icon"
            disabled={isDeleting}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="size-10 shrink-0 rounded-lg border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-0">
        <InfoRow
          icon={Calendar}
          label={t('columns.posted', { ns: 'requests/list' })}
          value={postedDate}
        />
        {region && (
          <InfoRow icon={MapPin} label={t('labels.location')} value={region} />
        )}
        {categoryName && (
          <div className="flex items-center gap-3 py-1.5">
            <Tag className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-20 shrink-0">
              {t('labels.part_category')}
            </span>
            <span className="text-sm text-foreground flex items-center gap-1.5">
              <CategoryDisplay
                category={request.category}
                showName={false}
                iconClassName="size-3.5"
              />
              {tCategory(categoryName, t)}
            </span>
          </div>
        )}
        {request.notes && (
          <InfoRow
            icon={MessageSquare}
            label={t('labels.description')}
            value={request.notes}
          />
        )}
      </div>
    </>
  )

  return (
    <div className="flex-1 flex flex-col w-full pb-20 lg:pb-8">
      {/* TOP NAV */}
      <div className="flex items-center px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-sm font-bold"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
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
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-3 py-2 lg:hidden"
        style={{
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <>
              <Button
                disabled={isEditDialogOpen}
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 gap-1 h-9 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
              >
                <Edit className="size-3.5 shrink-0" />
                {t('actions.edit')}
              </Button>
              {request.quotes?.some((q: any) => q.status === 'accepted') && (
                <Button
                  variant="default"
                  disabled={isFulfilling}
                  onClick={handleFulfill}
                  className="flex-1 gap-1 h-9 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isFulfilling ? (
                    <Loader2 className="size-3.5 animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  )}
                  {t('actions.mark_fulfilled')}
                </Button>
              )}
              <Button
                variant="outline"
                disabled={isCancelling}
                onClick={handleCancel}
                className="flex-1 gap-1 h-9 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
              >
                {isCancelling ? (
                  <Loader2 className="size-3.5 animate-spin shrink-0" />
                ) : (
                  <XCircle className="size-3.5 shrink-0" />
                )}
                {t('actions.close_request_btn')}
              </Button>
            </>
          ) : request.status === 'cancelled' ? (
            <>
              <Button
                disabled={isEditDialogOpen}
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 gap-1 h-9 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
              >
                <Edit className="size-3.5 shrink-0" />
                {t('actions.edit')}
              </Button>
              <Button
                variant="outline"
                disabled={isReopening}
                onClick={handleReopen}
                className="flex-1 gap-1 h-9 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                {isReopening ? (
                  <Loader2 className="size-3.5 animate-spin shrink-0" />
                ) : (
                  <RefreshCcw className="size-3.5 shrink-0" />
                )}
                {t('actions.reopen_request_btn')}
              </Button>
            </>
          ) : null}
          {request.status !== 'fulfilled' && (
            <Button
              variant="outline"
              size="icon"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(true)}
              className="size-9 shrink-0 rounded-lg border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <EditRequestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        request={request}
      />
      <ActionConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('dialogs.delete.title')}
        description={t('dialogs.delete.description', { ns: 'requests/list' })}
        confirmLabel={t('actions.delete')}
        confirmIcon={<Trash2 className="size-4" />}
        variant="destructive"
        isLoading={isDeleting}
        loadingLabel={t('actions.deleting')}
        onConfirm={handleDelete}
      />
      <Dialog
        open={!!contactingSeller}
        onOpenChange={(open) => !open && setContactingSeller(null)}
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {t('contact.title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('contact.connect_desc', {
                name: contactingSeller?.storeName || contactingSeller?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted/40 rounded-xl p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                {(contactingSeller?.storeName ||
                  contactingSeller?.name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-black text-sm">
                  {contactingSeller?.storeName || contactingSeller?.name}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" />
                  {contactingSeller?.wilaya || t('contact.default_location')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleContactWhatsApp(contactingSeller)}
              className="h-12 rounded-xl gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold"
            >
              <MessageCircle className="size-5 fill-current" />{' '}
              {t('contact.whatsapp')}
            </Button>
            <Button
              onClick={() => handleContactCall(contactingSeller?.phoneNumber)}
              variant="outline"
              className="h-12 rounded-xl gap-2 w-full font-bold"
            >
              <Phone className="size-4" /> {t('contact.call')}
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
        <h2 className="text-lg font-black tracking-tight">
          {t('errors.not_found', { defaultValue: 'Request Not Found' })}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t('errors.not_found_desc', {
            defaultValue: "We couldn't find the request you're looking for.",
          })}
        </p>
      </div>
      <Link to="/dashboard/requests">
        <Button variant="outline" size="sm" className="h-10 rounded-xl">
          {t('actions.back_to_list')}
        </Button>
      </Link>
    </div>
  )
}

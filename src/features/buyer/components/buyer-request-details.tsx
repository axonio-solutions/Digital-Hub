import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react'
import {
  useRequestDetails,
  useCancelRequest,
  useDeleteRequest,
  useReopenRequest
} from '@/features/requests/hooks/use-requests'
import {
  useAcceptQuote,
  useRejectQuote,
  useUnrejectQuote,
  useRevokeQuote
} from '@/features/quotes/hooks/use-quotes'
import { ImageSlider } from '@/components/ui/image-slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { EditRequestDialog } from '@/features/requests/components/edit-request-dialog'
import { QuoteList } from '@/features/quotes/components/quote-list'
import { cn } from '@/lib/utils'

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

  const handleCancel = () => {
    cancelRequest(requestId, {
      onSuccess: () => {
        toast.success('Request closed successfully')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to close request')
      }
    })
  }

  const handleReopen = () => {
    reopenRequest(requestId, {
      onSuccess: () => {
        toast.success('Request reopened successfully')
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to reopen request')
      }
    })
  }

  const handleDelete = () => {
    deleteRequest(requestId, {
      onSuccess: () => {
        toast.success('Request deleted successfully')
        navigate({ to: '/dashboard/requests' })
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to delete request')
      }
    })
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleAccept = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    acceptQuote({ quoteId, requestId }, {
      onSuccess: () => {
        toast.success('Quote accepted! You can now contact the seller.')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to accept quote')
        setProcessingQuoteId(null)
      }
    })
  }

  const handleReject = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    rejectQuote(quoteId, {
      onSuccess: () => {
        toast.success('Offer rejected')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to reject offer')
        setProcessingQuoteId(null)
      }
    })
  }

  const handleUnreject = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    unrejectQuote(quoteId, {
      onSuccess: () => {
        toast.success('Offer restored to pending')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to restore offer')
        setProcessingQuoteId(null)
      }
    })
  }

  const handleRevoke = (quoteId: string) => {
    setProcessingQuoteId(quoteId)
    revokeQuote({ quoteId, requestId }, {
      onSuccess: () => {
        toast.success('Acceptance revoked. The request is now open again.')
        setProcessingQuoteId(null)
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to revoke acceptance')
        setProcessingQuoteId(null)
      }
    })
  }

  const [contactingSeller, setContactingSeller] = useState<any>(null)

  const handleContactWhatsApp = (seller: any) => {
    const number = seller?.whatsappNumber || seller?.phoneNumber
    if (!number) {
      toast.error('No WhatsApp number available')
      return
    }
    const cleanNumber = number.replace(/\D/g, '')
    const message = encodeURIComponent(`Hi ${seller.storeName || seller.name}, I'm interested in your offer for "${request?.partName || 'part'}".`)
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank')
  }

  const handleContactCall = (phoneNumber?: string) => {
    if (!phoneNumber) {
      toast.error('Phone number not available')
      return
    }
    window.location.href = `tel:${phoneNumber}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{t('errors.not_found', { defaultValue: 'Request Not Found' })}</h2>
        <p className="text-red-600 dark:text-red-300">{t('errors.not_found_desc', { defaultValue: "We couldn't find the request you're looking for." })}</p>
        <Link to="/dashboard/requests" className="mt-4 inline-block">
          <Button variant="outline">{t('actions.back_to_list')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="layout-container flex justify-center w-full py-2 px-2 sm:px-4 lg:px-6">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="mb-2">
          <Link to="/dashboard/requests">
            <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-secondary dark:hover:bg-muted transition-all" onClick={() => window.history.back()}>
              <ArrowLeft className="size-3.5" /> {t('actions.back_to_list')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:col-span-12 xl:grid-cols-12 gap-6 lg:gap-8">

          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24">

              <div className="bg-gray-50 dark:bg-gray-900 w-full overflow-hidden">
                <ImageSlider
                  images={request.imageUrls || []}
                  aspectRatio="4/3"
                  className="rounded-none border-none shadow-none"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight mb-1 uppercase">
                        {request.partName}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl border-none shadow-xl bg-white dark:bg-slate-900">
                          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="gap-2 font-bold uppercase text-[10px] tracking-widest p-3 cursor-pointer">
                            <Edit className="size-3.5" /> {t('actions.edit_details')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShare} className="gap-2 font-bold uppercase text-[10px] tracking-widest p-3 cursor-pointer">
                            <Share2 className="size-3.5" /> {t('actions.copy_link')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                          <DropdownMenuItem
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="gap-2 font-bold uppercase text-[10px] tracking-widest p-3 cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="size-3.5" /> {t('actions.delete_request')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <GlowingBadge
                        variant={request.status === 'open' ? 'success' : 'neutral'}
                        pulse={request.status === 'open'}
                        className="px-2.5 py-1"
                      >
                        {request.status}
                      </GlowingBadge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 py-0.5 h-auto px-1.5 rounded-md">
                      {request.brand?.brand || request.vehicleBrand}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-none px-1.5 py-0.5 rounded-md">
                      {request.category?.name || t('labels.not_specified')}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold uppercase text-[9px] tracking-widest border-none px-1.5 py-0.5 rounded-md">
                      {request.brand?.clusterRegion || t('labels.general')}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground italic opacity-80 mt-1">
                    {t('labels.model_year')}: {request.modelYear}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 border-b border-border pb-1 w-fit">{t('labels.description')}</h3>
                    <p className="text-sm leading-relaxed text-foreground dark:text-gray-300 font-medium">
                      {request.notes || t('labels.no_notes')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('columns.posted', { ns: 'requests/list' })}</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Calendar className="size-3.5 text-primary" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('columns.status', { ns: 'requests/list' })}</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
                        <div className={cn("size-2 rounded-full", request.status === 'open' ? "bg-emerald-500 animate-pulse" : "bg-gray-400")} />
                        <span>{t(`filters.statuses.${request.status}`, { ns: 'requests/list' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  {request.status === 'open' ? (
                    <Button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-black uppercase text-xs tracking-widest rounded-2xl"
                    >
                      <CheckCircle2 className="size-4 text-green-600" />
                      {isCancelling ? t('dialogs.cancel.cancelling', { ns: 'requests/list' }) : t('actions.close_request')}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReopen}
                      disabled={isReopening}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 font-black uppercase text-xs tracking-widest rounded-2xl"
                    >
                      <Clock className="size-4 text-primary" />
                      {isReopening ? t('dialogs.reopen.reopening', { ns: 'requests/list' }) : t('actions.reopen_request')}
                    </Button>
                  )}
                  <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium opacity-60 italic">
                    {request.status === 'open'
                      ? t('hints.fulfill_desc', { defaultValue: 'Mark this request as fulfilled or no longer needed.' })
                      : t('hints.closed_desc', { defaultValue: 'This request is currently closed. Reopen to receive more offers.' })}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <EditRequestDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            request={request}
          />

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="rounded-3xl border-none shadow-2xl p-8 bg-white dark:bg-slate-950">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  {t('dialogs.delete.title')}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 italic mt-2 leading-relaxed">
                  {t('dialogs.delete.description', { ns: 'requests/list' })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-8 gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-800"
                >
                  {t('dialogs.cancel')}
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? t('dialogs.delete.deleting', { ns: 'requests/list' }) : t('dialogs.delete.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <section className="lg:col-span-8 flex flex-col gap-6">
            <QuoteList
              quotes={request.quotes || []}
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

        <Dialog open={!!contactingSeller} onOpenChange={(open) => !open && setContactingSeller(null)}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
            <div className="p-8 pb-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  {t('contact.title')}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 italic mt-1 leading-relaxed">
                  {t('contact.connect_desc', { name: contactingSeller?.storeName || contactingSeller?.name, defaultValue: `Connect with ${contactingSeller?.storeName || contactingSeller?.name} to finalize your purchase.` })}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 pt-0 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-3">
                  <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg">
                    {(contactingSeller?.storeName || contactingSeller?.name)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-slate-900 dark:text-white text-sm tracking-tight">{contactingSeller?.storeName || contactingSeller?.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <MapPin className="size-3 text-primary" />
                      {contactingSeller?.wilaya || t('contact.default_location', { defaultValue: 'Algeria' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="opacity-60 uppercase tracking-widest text-[9px]">{t('contact.phone_label', { defaultValue: 'Phone' })}</span>
                    <span className="text-slate-900 dark:text-white font-black">{contactingSeller?.phoneNumber || t('contact.not_listed', { defaultValue: 'Not listed' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="opacity-60 uppercase tracking-widest text-[9px]">{t('contact.store_address', { defaultValue: 'Store Address' })}</span>
                    <span className="text-slate-900 dark:text-white font-black truncate max-w-[180px]">{contactingSeller?.address || t('contact.main_store', { defaultValue: 'Main Store' })}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => handleContactWhatsApp(contactingSeller)}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
                >
                  <MessageCircle className="size-5 fill-current" />
                  {t('contact.whatsapp')}
                </Button>

                <Button
                  onClick={() => handleContactCall(contactingSeller?.phoneNumber)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <Phone className="size-5" />
                  {t('contact.call')}
                </Button>
              </div>

              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-60">
                {t('contact.hint')}
              </p>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

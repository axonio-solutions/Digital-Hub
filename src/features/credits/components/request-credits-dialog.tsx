'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Coins, Loader2, Package, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DirectionProvider } from '@/components/ui/direction'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequestCredits, useActiveCreditPackages } from '@/features/credits/hooks/use-credits'
import { cn } from '@/lib/utils'

interface RequestCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestCreditsDialog({ open, onOpenChange }: RequestCreditsDialogProps) {
  const { t, i18n } = useTranslation('dashboard/credits')
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null)
  const { mutate: requestCredits, isPending } = useRequestCredits()
  const { data: packages = [], isLoading } = useActiveCreditPackages()

  const activePackages = packages.filter((p: any) => p.isActive)
  const selectedPkg = activePackages.find((p: any) => p.id === selectedPkgId)

  const handleRequest = () => {
    if (!selectedPkg) {
      toast.error(t('billing.request_select_package'))
      return
    }
    requestCredits(
      { credits: selectedPkg.credits, packageId: selectedPkg.id },
      {
        onSuccess: () => {
          toast.success(t('billing.request_success'))
          setSelectedPkgId(null)
          onOpenChange(false)
        },
        onError: (err: any) => toast.error(err.message || t('billing.request_error_submit')),
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setSelectedPkgId(null)
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DirectionProvider dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Send className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            {t('billing.request_title')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : activePackages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs font-medium">
            <Package className="size-8 mx-auto mb-2 opacity-40" />
            {t('billing.request_no_packages')}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Package className="size-3" /> {t('packages.title')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {activePackages.map((pkg: any) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all',
                      selectedPkgId === pkg.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm shadow-amber-500/10'
                        : 'border-border bg-card hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-sm',
                    )}
                  >
                    <div className={cn(
                      'size-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                      selectedPkgId === pkg.id
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-muted border-border text-muted-foreground',
                    )}>
                      <Coins className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-sm font-black block',
                        selectedPkgId === pkg.id && 'text-amber-700 dark:text-amber-300',
                      )}>{pkg.name}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {pkg.description || `${pkg.credits} ${t('packages.credits_unit')}`}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn(
                        'text-sm font-black tabular-nums',
                        selectedPkgId === pkg.id ? 'text-amber-700 dark:text-amber-300' : 'text-foreground',
                      )}>
                        {pkg.credits}cr
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        {pkg.price.toLocaleString()} {t('currency_dzd')}
                      </div>
                    </div>
                    {selectedPkgId === pkg.id && (
                      <div className="size-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => handleOpenChange(false)} className="h-9 px-4 rounded-lg text-xs font-bold">
                {t('packages.form.cancel')}
              </Button>
              <Button
                onClick={handleRequest}
                disabled={!selectedPkg || isPending}
                className={cn(
                  'h-9 px-4 rounded-lg text-xs font-bold transition-all',
                  selectedPkg && 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/20',
                )}
              >
                {isPending ? (
                  <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> {t('billing.request_submitting')}</>
                ) : (
                  <><Send className="size-3.5 mr-1.5" /> {t('billing.request_action')}</>
                )}
              </Button>
            </div>
          </div>
        )}
        </DirectionProvider>
      </DialogContent>
    </Dialog>
  )
}

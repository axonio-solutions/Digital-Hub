'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { Coins, Loader2, Package, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCreditPackages, useGrantCredits } from '../hooks/use-credits'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000]

interface GrantCreditsDialogProps {
  seller: { id: string; name: string; storeName?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showPackages?: boolean
}

export function GrantCreditsDialog({ seller, open, onOpenChange, showPackages }: GrantCreditsDialogProps) {
  const { t } = useTranslation('dashboard/credits')
  const { toast } = useToast('dashboard/credits')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const { mutate: grantCredits, isPending } = useGrantCredits()
  const { data: packages = [] } = useCreditPackages()

  if (!seller) return null

  const handleGrant = () => {
    if (amount <= 0) {
      toast.error('distribute.grant.error_amount')
      return
    }
    grantCredits(
      { sellerId: seller.id, amount, description: description || undefined },
      {
        onSuccess: () => {
          toast.success('distribute.grant.success', { values: { amount, name: seller.name } })
          setAmount(0)
          setDescription('')
          onOpenChange(false)
        },
        onError: (err: any) => {
          toast.error('distribute.grant.error_failed', { error: err.message })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Coins className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            {t('distribute.grant.title')}
          </DialogTitle>
        </DialogHeader>

        {/* Seller Info */}
        <div className="flex items-center gap-3 p-3 -mt-1 rounded-xl bg-muted/40 border border-border">
          <Avatar className="size-10 rounded-xl">
            <AvatarFallback className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-black rounded-xl">
              {seller.name?.substring(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm truncate flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground shrink-0" />
              {seller.name}
            </p>
            {seller.storeName && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                <Store className="size-3 shrink-0" />
                {seller.storeName}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Credit Packages + Quick Amounts inline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {showPackages && packages.filter((p: any) => p.isActive).length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Package className="size-3" /> {t('packages.title')}
                </Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {packages.filter((p: any) => p.isActive).map((pkg: any) => {
                    const selected = amount === pkg.credits
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setAmount(pkg.credits)
                          setDescription(pkg.description || pkg.name)
                        }}
                        className={cn(
                          'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-all',
                          selected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-border bg-card hover:border-amber-200 dark:hover:border-amber-800',
                        )}
                      >
                        <span className={cn(
                          'text-xs font-bold',
                          selected ? 'text-amber-700 dark:text-amber-300' : 'text-foreground',
                        )}>{pkg.name}</span>
                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                          {pkg.credits} {t('packages.credits_unit')} / {pkg.price.toLocaleString()} {t('currency_dzd')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('distribute.grant.quick_amounts')}
              </Label>
              <div className="flex flex-wrap gap-1 sm:flex-wrap flex-nowrap overflow-x-auto pb-1 -mb-1 scrollbar-thin">
                {QUICK_AMOUNTS.map((a) => (
                  <Button
                    key={a}
                    variant={amount === a ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(a)}
                    className={cn(
                      'h-7 min-w-[48px] text-[10px] font-bold px-2 transition-all',
                      amount === a && 'bg-amber-600 hover:bg-amber-700 text-white',
                    )}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount + Description inline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('distribute.grant.amount')}
              </Label>
              <div className="relative">
                <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  value={amount || ''}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="pl-8 h-9 text-base font-bold tabular-nums rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('distribute.grant.description')}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('distribute.grant.description_placeholder')}
                className="h-9 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-lg text-xs font-bold w-full sm:w-auto"
            >
              {t('packages.form.cancel')}
            </Button>
            <Button
              onClick={handleGrant}
              disabled={amount <= 0 || isPending}
              className={cn(
                'h-9 px-4 rounded-lg text-xs font-bold transition-all w-full sm:w-auto',
                amount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/20'
                  : '',
              )}
            >
              {isPending ? (
                <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> {t('distribute.grant.processing')}</>
              ) : (
                <><Coins className="size-3.5 mr-1.5" /> {t('distribute.grant.confirm', { amount })}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

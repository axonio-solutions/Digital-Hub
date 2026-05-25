'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Edit3,
  HelpCircle,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'
import {
  useSubmitQuote,
  useUpdateQuote,
} from '@/features/marketplace/hooks/use-marketplace'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SubmitOfferTabProps {
  requestId: string
  sellerId: string
  isLoading?: boolean
  onSuccess: () => void
  showLifecycle?: boolean
  editData?: {
    id: string
    price: number
    condition: string
    warranty: string | null
  } | null
}

const WARRANTY_VALUES = [
  'None',
  '3 Months',
  '6 Months',
  '12 Months',
  'Custom',
] as const

function formatPrice(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString()
}

export function SubmitOfferTab({
  requestId,
  sellerId,
  isLoading,
  onSuccess,
  showLifecycle = true,
  editData,
}: SubmitOfferTabProps) {
  const { t } = useTranslation('marketplace')
  const warrantyLabels: Record<string, string> = {
    None: t('dialog_form.warranty_none'),
    '3 Months': t('dialog_form.warranty_3m'),
    '6 Months': t('dialog_form.warranty_6m'),
    '12 Months': t('dialog_form.warranty_12m'),
    Custom: t('dialog_form.warranty_custom'),
  }
  const [condition, setCondition] = useState<'new' | 'used'>('new')
  const [warrantyPreset, setWarrantyPreset] = useState('None')
  const [customWarranty, setCustomWarranty] = useState('')
  const [priceRaw, setPriceRaw] = useState('')

  const warranty =
    warrantyPreset === 'Custom'
      ? customWarranty
      : warrantyPreset === 'None'
        ? ''
        : warrantyPreset

  useEffect(() => {
    if (editData) {
      setCondition((editData.condition as 'new' | 'used') || 'new')
      setPriceRaw(editData.price?.toString() || '')
      const w = editData.warranty || ''
      if (!w) {
        setWarrantyPreset('None')
        setCustomWarranty('')
      } else if (
        WARRANTY_VALUES.includes(w as (typeof WARRANTY_VALUES)[number])
      ) {
        setWarrantyPreset(w)
        setCustomWarranty('')
      } else {
        setWarrantyPreset('Custom')
        setCustomWarranty(w)
      }
    } else {
      setCondition('new')
      setPriceRaw('')
      setWarrantyPreset('None')
      setCustomWarranty('')
    }
  }, [editData])

  const { mutate: submitQuote, isPending: isSubmitting } = useSubmitQuote()
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuote()
  const isPending = isSubmitting || isUpdating
  const isEditing = !!editData?.id
  const { toast } = useToast('marketplace')

  const priceNum = parseInt(priceRaw.replace(/\D/g, ''), 10)
  const priceValid = priceNum > 0

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setPriceRaw(digits)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!priceValid) {
      toast.error(t('dialog_form.price_error'))
      return
    }
    const data = {
      requestId,
      sellerId,
      price: priceNum,
      condition,
      warranty: warranty || undefined,
    }
    if (isEditing) {
      updateQuote(
        { id: editData.id, data },
        {
          onSuccess: () => {
            toast.success('toasts.update_success')
            onSuccess()
          },
          onError: (err: any) => {
            toast.error('toasts.update_error', { error: err.message })
          },
        },
      )
    } else {
      submitQuote(data, {
        onSuccess: () => {
          toast.success('toasts.submit_success')
          onSuccess()
        },
        onError: (err: any) => {
          toast.error('toasts.submit_error', { error: err.message })
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-5 space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 flex-1 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
      {/* ── Price ────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/55 block">
          {t('dialog_form.your_price')}
        </label>
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 bg-muted/30',
            priceValid
              ? 'border-primary/40 bg-primary/[0.03]'
              : 'border-border/60 focus-within:border-primary/40 focus-within:bg-primary/[0.02]',
          )}
        >
          <input
            type="text"
            inputMode="numeric"
            value={priceRaw ? formatPrice(priceRaw) : ''}
            onChange={handlePriceChange}
            placeholder={t('dialog_form.price_placeholder')}
            className={cn(
              'flex-1 bg-transparent border-0 outline-none ring-0 p-0',
              'text-3xl font-mono font-bold leading-none tabular-nums',
              'placeholder:text-muted-foreground/20 text-foreground',
            )}
          />
          <span
            className={cn(
              'text-sm font-bold shrink-0 transition-colors',
              priceValid ? 'text-primary/60' : 'text-muted-foreground/30',
            )}
          >
            {t('dialog_form.currency')}
          </span>
        </div>
      </div>

      {/* ── Condition ────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/55 block">
          {t('dialog_form.part_condition')}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {(
            [
              {
                value: 'new' as const,
                icon: Sparkles,
                title: t('detail_page.new_oem'),
                desc: t('dialog_form.new_oem_desc'),
                active:
                  'border-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-950/30',
                icon_cls: 'text-emerald-600',
              },
              {
                value: 'used' as const,
                icon: RotateCcw,
                title: t('conditions.used'),
                desc: t('dialog_form.used_desc'),
                active:
                  'border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/30',
                icon_cls: 'text-amber-600',
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCondition(opt.value)}
              className={cn(
                'flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer',
                condition === opt.value
                  ? opt.active
                  : 'border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50',
              )}
            >
              <opt.icon
                className={cn(
                  'size-4 transition-colors',
                  condition === opt.value
                    ? opt.icon_cls
                    : 'text-muted-foreground/40',
                )}
              />
              <div>
                <p
                  className={cn(
                    'text-xs font-bold leading-none',
                    condition === opt.value
                      ? 'text-foreground'
                      : 'text-muted-foreground/60',
                  )}
                >
                  {opt.title}
                </p>
                <p className="text-[10px] text-muted-foreground/45 mt-0.5 leading-tight">
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Warranty ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/55 block">
          {t('form.warranty_label')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WARRANTY_VALUES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setWarrantyPreset(preset)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer',
                warrantyPreset === preset
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground/60 border-border/50 hover:border-border hover:text-foreground',
              )}
            >
              {warrantyLabels[preset]}
            </button>
          ))}
        </div>
        {warrantyPreset === 'Custom' && (
          <input
            type="text"
            value={customWarranty}
            onChange={(e) => setCustomWarranty(e.target.value)}
            placeholder={t('dialog_form.custom_warranty_placeholder')}
            className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all outline-none placeholder:text-muted-foreground/30 mt-1"
            autoFocus
          />
        )}
      </div>

      {/* ── Offer preview ────────────────────────────────────────────── */}
      {priceValid && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] border border-primary/15">
          <ShieldCheck className="size-4 text-primary/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground/60 mb-0.5">
              {t('dialog_form.offer_summary')}
            </p>
            <p className="text-sm font-bold text-foreground truncate">
              {formatPrice(priceRaw)} DA
              <span className="font-normal text-muted-foreground/60 ms-2">
                ·
              </span>
              <span className="font-normal text-muted-foreground/70 ms-2">
                {condition === 'new'
                  ? t('dialog_form.new_oem_short')
                  : t('conditions.used')}
              </span>
              {warranty && (
                <>
                  <span className="font-normal text-muted-foreground/60 ms-2">
                    ·
                  </span>
                  <span className="font-normal text-muted-foreground/70 ms-2">
                    {warranty}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="submit"
          disabled={isPending || !priceValid}
          className="w-full h-11 gap-2 text-sm font-bold rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isEditing ? t('dialog_form.update') : t('dialog_form.submit')}
        </Button>
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-2 text-xs font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          {t('dialog_form.cancel')}
        </button>
      </div>
    </form>
  )

  if (!showLifecycle) return formContent

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
      <div className="border-r border-border/30 overflow-y-auto">
        {formContent}
      </div>

      {/* Lifecycle panel */}
      <div className="p-5 overflow-y-auto">
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-muted/20 to-muted/5 overflow-hidden h-full flex flex-col">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/30">
            <HelpCircle className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {t('dialog_form.lifecycle_title')}
            </h4>
          </div>
          <div className="p-4 flex flex-col flex-1 gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="size-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="size-3 text-amber-700" />
                </div>
                <div className="w-0.5 h-6 bg-border/60" />
                <div className="size-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="size-3 text-[#0369A1]" />
                </div>
                <div className="w-0.5 h-6 bg-border/60" />
                <div className="size-5 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="size-3 text-red-500" />
                </div>
              </div>
              <div className="space-y-3 pt-0.5">
                {[
                  {
                    key: 'pending',
                    title: t('dialog_form.lifecycle_pending'),
                    desc: t('dialog_form.lifecycle_pending_desc'),
                  },
                  {
                    key: 'discussion',
                    title: t('dialog_form.lifecycle_discussion'),
                    desc: t('dialog_form.lifecycle_discussion_desc'),
                  },
                  {
                    key: 'declined',
                    title: t('dialog_form.lifecycle_declined'),
                    desc: t('dialog_form.lifecycle_declined_desc'),
                  },
                ].map((s) => (
                  <div key={s.key}>
                    <p className="text-xs font-bold text-foreground">
                      {s.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-border/20 mt-auto">
              <Edit3 className="size-3 text-muted-foreground/40 shrink-0" />
              <p className="text-[10px] text-muted-foreground/50">
                {t('dialog_form.lifecycle_edit_note')}{' '}
                <strong>{t('dialog_form.lifecycle_pending')}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

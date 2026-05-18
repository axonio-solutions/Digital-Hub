'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldAlert, UserX, UserCheck, Copy, Check, Coins, Mail, Phone, MapPin, Calendar, Store, FileText, Ban } from 'lucide-react'
import { CategoryDisplay } from '@/components/ui/category-display'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useActivateSeller, useToggleUserBan, useUserDetails } from '@/features/admin/hooks/use-users'
import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'
import { GrantCreditsDialog } from '@/features/credits/components/grant-credits-dialog'

interface UserProfileDialogProps { user: any | null; open: boolean; onOpenChange: (open: boolean) => void }

export function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
  const { t } = useTranslation('dashboard/admin')
  const { toast } = useToast('dashboard/admin')
  const { mutate: activateSeller } = useActivateSeller()
  const { mutate: toggleBan } = useToggleUserBan()
  const [copied, setCopied] = useState<string | null>(null)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)

  const userId = user?.id || ''
  const { data: details, isLoading } = useUserDetails(userId)

  const u = details?.id === userId ? details : user
  if (!u) return null

  const isBanned = u.banned
  const isWaitlisted = u.account_status === 'waitlisted'
  const role = u.role || 'buyer'
  const accountAgeDays = Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000)

  const roleColor = role === 'admin' ? 'from-violet-600 to-purple-700'
    : role === 'seller' ? 'from-emerald-600 to-teal-700'
    : 'from-blue-600 to-cyan-700'

  const copy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success('users.profile.copied')
  }

  const requestCount = u.requests?.length ?? (role === 'buyer' ? '...' : 0)
  const quoteCount = u.quotes?.length ?? (role === 'seller' ? '...' : 0)
  const brandCount = u.sellerBrands?.length ?? 0
  const categoryCount = u.sellerCategories?.length ?? 0
  const priorityScore = u.priorityScore?.toFixed?.(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">

        {/* Header with inline avatar */}
        <div className={cn('h-1.5 w-full bg-gradient-to-r shrink-0', roleColor)} />
        <div className="flex items-center gap-4 px-5 sm:px-6 pt-4 pb-3">
          <Avatar className="size-14 rounded-2xl border-2 border-border shadow-lg shrink-0">
            <AvatarImage src={u.image} className="object-cover" />
            <AvatarFallback className={cn(
              'font-black text-xl uppercase rounded-2xl',
              role === 'admin' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                : role === 'seller' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
            )}>
              {u.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black tracking-tight text-foreground truncate">{u.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <GlowingBadge variant={role === 'admin' ? 'info' : role === 'seller' ? 'success' : 'neutral'} className="capitalize text-[10px]">{t(`users.roles.${role}`)}</GlowingBadge>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                u.account_status === 'active'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : u.account_status === 'waitlisted'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
              )}>
                {t(`users.account_status.${u.account_status || 'new'}`)}
              </span>
              {isBanned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                  <ShieldAlert size={10} />{t('users.profile.banned')}
                </span>
              )}
            </div>
            {/* Account badges under name */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <AccountBadge label={t('users.profile.labels.role')} value={t(`users.roles.${role}`)} variant={role === 'admin' ? 'info' : role === 'seller' ? 'success' : 'neutral'} />
              <AccountBadge label={t('users.profile.labels.verified')} value={u.emailVerified ? t('users.profile.pills.verified') : t('users.profile.pills.pending')} variant={u.emailVerified ? 'success' : 'warning'} />
              <AccountBadge label={t('users.profile.labels.age')} value={`${accountAgeDays}d`} />
              {u.storeName && <AccountBadge label={t('users.profile.labels.store')} value={u.storeName} icon={Store} />}
              {u.commercialRegister && <AccountBadge label={t('users.profile.labels.reg_number')} value={u.commercialRegister} icon={FileText} />}
              {isBanned && u.banReason && <AccountBadge label={t('users.profile.labels.ban')} value={u.banReason} icon={Ban} variant="error" />}
              {isBanned && u.banExpires && <AccountBadge label={t('users.profile.labels.expires')} value={new Date(u.banExpires).toLocaleDateString()} />}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 pb-4 max-h-[55vh] overflow-y-auto scrollbar-thin space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Analytics pills — moved up */}
              {role === 'buyer' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Pill value={isLoading ? '...' : requestCount} label={t('users.profile.pills.requests')} />
                  <Pill value={accountAgeDays} label={t('users.profile.pills.days')} />
                  <Pill value={u.emailVerified ? t('users.profile.pills.verified') : t('users.profile.pills.pending')} label={t('users.profile.labels.email')} />
                </div>
              )}
              {role === 'seller' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Pill value={isLoading ? '...' : quoteCount} label={t('users.profile.pills.quotes')} />
                    <Pill value={brandCount} label={t('users.profile.pills.brands')} />
                    <Pill value={categoryCount} label={t('users.profile.pills.categories')} />
                    <Pill value={priorityScore ?? '—'} label={t('users.profile.pills.priority')} />
                  </div>
                  {categoryCount > 0 && (
                    <div>
                      <Label>{t('users.profile.labels.categories')}</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.sellerCategories?.map((sc: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] rounded-full px-2.5 gap-1">
                            <CategoryDisplay category={sc.category} showName={false} iconClassName="size-3" />
                            {tCategory(sc.category?.name || sc.category, t)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {brandCount > 0 && (
                    <div>
                      <Label>{t('users.profile.labels.brands')}</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.sellerBrands?.map((sb: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px] rounded-full px-2.5">{sb.brand?.brand || t('users.profile.unknown_brand')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {role === 'admin' && (
                <div className="grid grid-cols-2 gap-2">
                  <Pill value={accountAgeDays} label={t('users.profile.pills.days_active')} />
                  <Pill value={u.emailVerified ? t('users.profile.pills.verified') : t('users.profile.pills.pending')} label={t('users.profile.labels.email')} />
                </div>
              )}

              {/* Contact info */}
              <div className="space-y-2">
                <Label>{t('users.profile.labels.contact')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <InfoRow icon={Mail} label={t('users.profile.labels.email')} value={u.email} copyable onCopy={() => copy(u.email, 'email')} copied={copied === 'email'} />
                  <InfoRow icon={Phone} label={t('users.profile.labels.phone')} value={u.phoneNumber || '—'} copyable={!!u.phoneNumber} onCopy={() => copy(u.phoneNumber, 'phone')} copied={copied === 'phone'} />
                  <InfoRow icon={MapPin} label={t('users.profile.labels.location')} value={[u.wilaya, u.city].filter(Boolean).join(', ') || '—'} />
                  <InfoRow icon={Calendar} label={t('users.profile.labels.joined')} value={new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <span className="hidden sm:inline text-[10px] font-mono text-slate-400">{u.id?.substring(0, 12)}</span>
          <div className="flex flex-col sm:flex-row gap-1.5">
            {role === 'seller' && (
              <Button onClick={() => setGrantDialogOpen(true)}
                className="h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg px-4 w-full sm:w-auto">
                <Coins size={14} className="me-1.5" /> {t('users.profile.credits')}
              </Button>
            )}
            {isWaitlisted && (
              <Button onClick={() => { activateSeller({ userId: u.id }); toast.success('users.profile.success.activated') }}
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg px-4 w-full sm:w-auto">
                <UserCheck size={14} className="me-1.5" /> {t('users.profile.activate')}
              </Button>
            )}
            <Button variant={isBanned ? 'default' : 'destructive'}
              onClick={() => { toggleBan({ userId: u.id, isBanned: !isBanned }); toast.success(isBanned ? 'users.profile.success.restored' : 'users.profile.success.suspended') }}
              className="h-9 font-bold uppercase text-[10px] tracking-wider rounded-lg px-4 w-full sm:w-auto">
              {isBanned ? <><ShieldCheck size={14} className="me-1.5" /> {t('users.profile.restore')}</>
                : <><UserX size={14} className="me-1.5" /> {t('users.profile.suspend')}</>}
            </Button>
          </div>
        </div>
      </DialogContent>

      <GrantCreditsDialog
        seller={{ id: u.id, name: u.name, storeName: u.storeName }}
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        showPackages
      />
    </Dialog>
  )
}

function Label({ children }: { children: string }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{children}</p>
}

function Pill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50">
      <span className="text-sm font-black tabular-nums leading-none text-slate-700 dark:text-slate-200">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, copyable, onCopy, copied }: any) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50">
      <Icon className="size-3.5 text-slate-400 shrink-0" />
      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider min-w-[44px] shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex-1 text-right">{value}</span>
      {copyable && (
        <button onClick={onCopy} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0">
          {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="text-slate-400" />}
        </button>
      )}
    </div>
  )
}

function AccountBadge({ label, value, variant, icon: Icon }: { label: string; value: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'; icon?: any }) {
  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50">
      {Icon && <Icon className="size-3 text-slate-400 shrink-0" />}
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <GlowingBadge variant={variant || 'neutral'} className="text-[9px]">{value}</GlowingBadge>
    </div>
  )
}

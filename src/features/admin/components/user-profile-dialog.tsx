'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldAlert, UserX, UserCheck, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useActivateSeller, useToggleUserBan, useUserDetails } from '@/features/admin/hooks/use-users'
import { useTranslation } from 'react-i18next'

interface UserProfileDialogProps { user: any | null; open: boolean; onOpenChange: (open: boolean) => void }

export function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
  const { t } = useTranslation('dashboard/admin')
  const { mutate: activateSeller } = useActivateSeller()
  const { mutate: toggleBan } = useToggleUserBan()
  const [copied, setCopied] = useState<string | null>(null)

  const userId = user?.id || ''
  const { data: details, isLoading } = useUserDetails(userId)

  // Use details from DB when loaded, fallback to table row data
  const u = details || user
  if (!u) return null

  const isBanned = u.banned
  const isWaitlisted = u.account_status === 'waitlisted'
  const role = u.role || 'buyer'
  const accountAgeDays = Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000)

  const coverGradient = role === 'admin' ? 'from-violet-600 to-purple-700' 
    : role === 'seller' ? 'from-emerald-600 to-teal-700' 
    : 'from-blue-600 to-cyan-700'

  const copy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success(t('users.profile.copied'))
  }

  // Role-specific data
  const requestCount = u.requests?.length ?? (role === 'buyer' ? '...' : 0)
  const quoteCount = u.quotes?.length ?? (role === 'seller' ? '...' : 0)
  const brandCount = u.sellerBrands?.length ?? 0
  const categoryCount = u.sellerCategories?.length ?? 0
  const priorityScore = u.priorityScore?.toFixed?.(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto min-w-[380px] max-w-lg max-h-[92vh] p-0 border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
        
        {/* Cover Banner */}
        <div className={cn('h-24 bg-gradient-to-r relative', coverGradient)}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
          <Avatar className="absolute -bottom-8 left-6 h-16 w-16 border-[4px] border-background shadow-xl rounded-2xl">
            <AvatarImage src={u.image} className="object-cover" />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xl uppercase rounded-2xl">
              {u.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name + Badges */}
        <div className="pt-10 px-6">
          <h3 className="text-lg font-black tracking-tight text-foreground truncate">{u.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <GlowingBadge variant={role === 'admin' ? 'info' : role === 'seller' ? 'success' : 'neutral'} className="capitalize text-[10px]">{role}</GlowingBadge>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
              u.account_status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
              u.account_status === 'waitlisted' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
              'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
            )}>
              {u.account_status || 'new'}
            </span>
            {isBanned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"><ShieldAlert size={10} />Banned</span>}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[45vh] overflow-y-auto scrollbar-thin space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Field label="Email" value={u.email} copyable onCopy={() => copy(u.email, 'email')} copied={copied === 'email'} />
                  <Field label="Phone" value={u.phoneNumber || '—'} copyable={!!u.phoneNumber} onCopy={() => copy(u.phoneNumber, 'phone')} copied={copied === 'phone'} />
                  <Field label="Location" value={[u.wilaya, u.city].filter(Boolean).join(', ') || '—'} />
                  <Field label="Joined" value={new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} />
                </div>

                <div className="space-y-2">
                  <Label>Account</Label>
                  <Field label="Role" value={role} badge />
                  <Field label="Verified" value={u.emailVerified ? 'Yes' : 'No'} />
                  <Field label="Age" value={`${accountAgeDays} days`} />
                  {u.storeName && <Field label="Store" value={u.storeName} />}
                  {u.commercialRegister && <Field label="Reg #" value={u.commercialRegister} mono />}
                  {isBanned && u.banReason && <Field label="Ban Reason" value={u.banReason} />}
                  {isBanned && u.banExpires && <Field label="Expires" value={new Date(u.banExpires).toLocaleDateString()} />}
                </div>
              </div>

              {/* Role-specific stats */}
              {role === 'buyer' && (
                <div className="grid grid-cols-3 gap-2">
                  <Pill value={isLoading ? '...' : requestCount} label="Requests" />
                  <Pill value={accountAgeDays} label="Days" />
                  <Pill value={u.emailVerified ? 'Verified' : 'Pending'} label="Email" />
                </div>
              )}

              {role === 'seller' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <Pill value={isLoading ? '...' : quoteCount} label="Quotes" />
                    <Pill value={brandCount} label="Brands" />
                    <Pill value={categoryCount} label="Categories" />
                    <Pill value={priorityScore ?? '—'} label="Priority" />
                  </div>
                  {categoryCount > 0 && (
                    <div>
                      <Label>Categories</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.sellerCategories?.map((sc: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] rounded-full px-2.5">{sc.category?.name || 'General'}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {brandCount > 0 && (
                    <div>
                      <Label>Brands</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.sellerBrands?.map((sb: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px] rounded-full px-2.5">{sb.brand?.brand || 'Unknown'}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === 'admin' && (
                <div className="grid grid-cols-2 gap-2">
                  <Pill value={accountAgeDays} label="Days Active" />
                  <Pill value={u.emailVerified ? 'Verified' : 'Pending'} label="Email" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-400">{u.id?.substring(0, 12)}</span>
          <div className="flex gap-2">
            {isWaitlisted && (
              <Button onClick={() => { activateSeller({ userId: u.id }); toast.success(t('users.profile.success.activated')) }}
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl px-4">
                <UserCheck size={14} className="me-1.5" /> Activate
              </Button>
            )}
            <Button variant={isBanned ? 'default' : 'destructive'}
              onClick={() => { toggleBan({ userId: u.id, isBanned: !isBanned }); toast.success(isBanned ? t('users.profile.success.restored') : t('users.profile.success.suspended')) }}
              className="h-9 font-bold uppercase text-[10px] tracking-wider rounded-xl px-4">
              {isBanned ? <><ShieldCheck size={14} className="me-1.5" /> Restore</>
                : <><UserX size={14} className="me-1.5" /> Suspend</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children }: { children: string }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{children}</p>
}

function Field({ label, value, badge, mono, copyable, onCopy, copied }: any) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50">
      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate">{label}</span>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {badge ? (
          <Badge variant="secondary" className="text-[10px] font-bold uppercase rounded-full px-2.5">{value}</Badge>
        ) : (
          <span className={cn('text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate text-right', mono && 'font-mono text-[10px]')}>{value}</span>
        )}
        {copyable && (
          <button onClick={onCopy} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
          </button>
        )}
      </div>
    </div>
  )
}

function Pill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50">
      <span className="text-sm font-black tabular-nums leading-none text-slate-700 dark:text-slate-200">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  )
}

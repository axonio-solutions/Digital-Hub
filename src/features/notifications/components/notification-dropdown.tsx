'use client'

import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  CreditCard,
  Headset,
  Info,
  MessageSquare,
  ScanText,
  ShoppingBag,
  Star,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/date-format'

type Props = {
  trigger: ReactElement
  notifications?: Array<any>
  total?: number
  hasMore?: boolean
  isLoading?: boolean
  isError?: boolean
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onLoadMore?: () => void
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const TYPE_ICONS: Record<
  string,
  { icon: any; iconColor: string; bgColor: string }
> = {
  NEW_OFFER: {
    icon: ShoppingBag,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  FIRST_QUOTE: {
    icon: ShoppingBag,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  MILESTONE_3_QUOTES: {
    icon: ShoppingBag,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  NEW_QUOTE: {
    icon: ShoppingBag,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  QUOTE_ACCEPTED: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  QUOTE_WON: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  QUOTE_REJECTED: {
    icon: BellRing,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  QUOTE_STATUS_CHANGE: {
    icon: ScanText,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  NEW_LEAD: {
    icon: MessageSquare,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  REQUEST_UPDATE: {
    icon: ScanText,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  SUPPORT_MESSAGE: {
    icon: Headset,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  SPAM_FLAG: {
    icon: BellRing,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  ABANDONED_REQUEST: {
    icon: BellRing,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  BOTTLENECK_ALERT: {
    icon: BellRing,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  ACCOUNT_APPROVED: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  NEW_SELLER_WAITLIST: {
    icon: BellRing,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  CREDIT_REQUEST: {
    icon: CreditCard,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  CREDIT_APPROVED: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  CREDIT_REJECTED: {
    icon: BellRing,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
}

function getIconConfig(notif: any) {
  if (notif?.type && TYPE_ICONS[notif.type]) return TYPE_ICONS[notif.type]
  const title = (notif?.title || '').toLowerCase()
  if (title.includes('offer') || title.includes('quote'))
    return TYPE_ICONS.NEW_OFFER
  if (title.includes('success') || title.includes('accepted'))
    return TYPE_ICONS.QUOTE_ACCEPTED
  if (
    title.includes('fail') ||
    title.includes('error') ||
    title.includes('rejected')
  )
    return TYPE_ICONS.QUOTE_REJECTED
  if (title.includes('message') || title.includes('chat'))
    return TYPE_ICONS.NEW_LEAD
  if (title.includes('update') || title.includes('status'))
    return TYPE_ICONS.REQUEST_UPDATE
  if (title.includes('support') || title.includes('help'))
    return TYPE_ICONS.SUPPORT_MESSAGE
  if (title.includes('alert') || title.includes('spam'))
    return TYPE_ICONS.SPAM_FLAG
  return { icon: Info, iconColor: 'text-muted-foreground', bgColor: 'bg-muted' }
}

export const NotificationDropdown = ({
  trigger,
  notifications = [],
  total = 0,
  hasMore = false,
  isLoading = false,
  isError = false,
  onMarkRead,
  onMarkAllRead,
  onLoadMore,
  defaultOpen,
  align = 'end',
}: Props) => {
  const { t, i18n } = useTranslation('notifications')

  const getTitle = useMemo(() => (notif: any) => notif.title || '', [])

  const getMessage = useMemo(() => (notif: any) => notif.message || '', [])

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        dir={i18n.dir()}
        className="p-0 w-[calc(100vw-2rem)] sm:w-[440px] rounded-xl border-border bg-card shadow-xl overflow-hidden"
      >
        <DropdownMenuGroup>
          {/* Header */}
          <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">{t('title')}</p>
              {total > 0 && (
                <span className="font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px]">
                  {t('new_count', { count: total > 10 ? '10+' : total })}
                </span>
              )}
            </div>
            {total > 0 && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAllRead?.()
                }}
                className="h-auto px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-semibold"
              >
                {t('clear_all')}
              </Button>
            )}
          </DropdownMenuLabel>

          {/* Items */}
          <div className="max-h-[60dvh] sm:max-h-[320px] overflow-y-auto py-1">
            {isLoading ? (
              <div className="py-2 px-2 flex flex-col gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                  >
                    <div className="size-8 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                      <div className="h-2.5 w-48 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <BellRing className="size-6 text-destructive/50" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('error', { defaultValue: 'Could not load notifications' })}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="size-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('empty')}
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const displayTitle = getTitle(notification)
                  const {
                    icon: Icon,
                    iconColor,
                    bgColor,
                  } = getIconConfig(notification)
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) onMarkRead?.(notification.id)
                        if (notification.linkUrl)
                          window.location.href = notification.linkUrl
                      }}
                      className={cn(
                        'mx-1.5 my-0.5 p-2.5 flex items-center justify-between cursor-pointer rounded-lg transition-all hover:bg-muted border border-transparent hover:border-border group/item',
                        !notification.isRead &&
                          'bg-primary/[0.04] border-primary/10',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn('p-2 rounded-lg shrink-0', bgColor)}>
                          <Icon size={16} className={cn('size-4', iconColor)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'text-[13px] truncate',
                              !notification.isRead
                                ? 'font-bold text-foreground'
                                : 'font-medium text-muted-foreground',
                            )}
                          >
                            {displayTitle}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground mt-0.5 max-w-[180px] sm:max-w-[280px]">
                            {getMessage(notification)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1 px-1">
                          <p className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                          {!notification.isRead && (
                            <div className="size-1.5 bg-primary rounded-full" />
                          )}
                        </div>

                        {!notification.isRead && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-7 rounded-lg bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              onMarkRead?.(notification.id)
                            }}
                            title={t('mark_read')}
                          >
                            <Check className="size-3.5 stroke-[3px]" />
                          </Button>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })}

                {hasMore && (
                  <div className="px-2 pb-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLoadMore?.()
                      }}
                      className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg h-8"
                    >
                      {t('load_more', { defaultValue: 'Load more' })}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

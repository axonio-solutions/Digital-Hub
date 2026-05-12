"use client"

import {
  Bell,
  Check,
  CheckCircle2,
  Headset,
  Info,
  ScanText,
  ShoppingBag,
  Star,
  Video,
} from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Props = {
  trigger: ReactElement
  notifications?: Array<any>
  unreadCount?: number
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const getIconConfig = (title: string = '') => {
  const t = title.toLowerCase()
  if (t.includes('offer') || t.includes('quote'))
    return { icon: ShoppingBag, iconColor: 'text-primary', bgColor: 'bg-primary/10' }
  if (t.includes('event'))
    return { icon: Star, iconColor: 'text-amber-500', bgColor: 'bg-amber-500/10' }
  if (t.includes('meeting') || t.includes('call'))
    return { icon: Video, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10' }
  if (t.includes('review') || t.includes('deliver'))
    return { icon: ScanText, iconColor: 'text-sky-500', bgColor: 'bg-sky-500/10' }
  if (t.includes('support') || t.includes('help'))
    return { icon: Headset, iconColor: 'text-rose-500', bgColor: 'bg-rose-500/10' }
  if (t.includes('success') || t.includes('completed'))
    return { icon: CheckCircle2, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10' }
  return { icon: Info, iconColor: 'text-muted-foreground', bgColor: 'bg-muted' }
}

export const NotificationDropdown = ({
  trigger,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  defaultOpen,
  align = 'end',
}: Props) => {
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="p-0 w-[calc(100vw-2rem)] sm:w-[380px] rounded-xl border-border bg-card shadow-xl overflow-hidden"
        >
          <DropdownMenuGroup>
            {/* Header */}
            <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <span className="font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onMarkAllRead?.() }}
                  className="h-auto px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-semibold"
                >
                  Clear all
                </Button>
              )}
            </DropdownMenuLabel>

            {/* Items */}
            <div className="max-h-[320px] overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="size-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">All caught up</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const { icon: Icon, iconColor, bgColor } = getIconConfig(notification.title)
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) onMarkRead?.(notification.id)
                        if (notification.linkUrl) window.location.href = notification.linkUrl
                      }}
                      className={cn(
                        "mx-1.5 my-0.5 p-2.5 flex items-center justify-between cursor-pointer rounded-lg transition-all hover:bg-muted border border-transparent hover:border-border group/item",
                        !notification.isRead && "bg-primary/[0.04] border-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("p-2 rounded-lg shrink-0", bgColor)}>
                          <Icon size={16} className={cn("size-4", iconColor)} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-[13px] truncate",
                            !notification.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <p className="max-w-[180px] sm:max-w-[260px] truncate text-[11px] text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1 px-1">
                          <p className="text-[10px] font-medium text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                          {!notification.isRead && (
                            <div className="size-1.5 bg-primary rounded-full" />
                          )}
                        </div>

                        {!notification.isRead && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-7 rounded-lg bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMarkRead?.(notification.id)
                                  }}
                                >
                                  <Check className="size-3.5 stroke-[3px]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-[10px] py-1 px-2.5 rounded-lg bg-foreground text-background font-semibold border-none">
                                Mark read
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })
              )}
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

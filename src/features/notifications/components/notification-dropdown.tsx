"use client";

import type { ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Headset,
  ScanText,
  Star,
  Video,
  Bell,
  ShoppingBag,
  Info,
  CheckCircle2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  trigger: ReactElement;
  notifications?: any[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const getIconConfig = (title: string = "") => {
  const t = title.toLowerCase();
  if (t.includes("offer") || t.includes("quote"))
    return { icon: ShoppingBag, iconColor: "stroke-blue-500", bgColor: "bg-blue-500/10 dark:bg-blue-500/20" };
  if (t.includes("event"))
    return { icon: Star, iconColor: "stroke-orange-400", bgColor: "bg-orange-400/10 dark:bg-orange-400/20" };
  if (t.includes("meeting") || t.includes("call"))
    return { icon: Video, iconColor: "stroke-teal-400", bgColor: "bg-teal-400/10 dark:bg-teal-400/20" };
  if (t.includes("review") || t.includes("deliver"))
    return { icon: ScanText, iconColor: "stroke-sky-400", bgColor: "bg-sky-400/10 dark:bg-sky-400/20" };
  if (t.includes("support") || t.includes("help"))
    return { icon: Headset, iconColor: "stroke-red-500", bgColor: "bg-red-500/10 dark:bg-red-500/20" };
  if (t.includes("success") || t.includes("completed"))
    return { icon: CheckCircle2, iconColor: "stroke-emerald-500", bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20" };

  return { icon: Info, iconColor: "stroke-slate-500", bgColor: "bg-slate-500/10 dark:bg-slate-500/20" };
};

export const NotificationDropdown = ({
  trigger,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  defaultOpen,
  align = "end"
}: Props) => {
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="p-0 w-[480px] rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 overflow-hidden"
        >
          <DropdownMenuGroup>
            {/* title */}
            <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  Notifications
                </p>
                {unreadCount > 0 && <Badge className="font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px]">{unreadCount} New</Badge>}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (notifications.length > 0) {
                      onMarkAllRead?.(); 
                    }
                  }}
                  className="h-auto px-3 py-1.5 text-xs text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all font-bold uppercase tracking-tight"
                >
                  Clear all
                </Button>
              )}
            </DropdownMenuLabel>

            {/* Notifications */}
            <div className="max-h-[350px] overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <div className="size-12 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                    <Bell className="size-6 text-slate-300 dark:text-slate-700" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-slate-600 font-medium italic">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const { icon: Icon, iconColor, bgColor } = getIconConfig(notification.title);
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) {
                          onMarkRead?.(notification.id);
                        }
                        if (notification.linkUrl) {
                          window.location.href = notification.linkUrl;
                        }
                      }}
                      className={cn(
                        "mx-1.5 my-1 p-2 flex items-center justify-between cursor-pointer rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900/80 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group/item",
                        !notification.isRead && "bg-primary/[0.03] dark:bg-primary/10 border-primary/10 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover/item:scale-110", bgColor)}>
                          <Icon size={18} className={cn("size-[18px]", iconColor)} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-sm truncate tracking-tight",
                            !notification.isRead ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-500 dark:text-slate-400"
                          )}>
                            {notification.title}
                          </p>
                          <p className="max-w-[320px] truncate text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1 px-1">
                          <p className="text-[10px] font-medium text-slate-400">
                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                          </p>
                          {!notification.isRead && <div className="size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
                        </div>

                        {!notification.isRead && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-8 rounded-xl bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all shrink-0 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkRead?.(notification.id);
                                  }}
                                >
                                  <Check className="size-4 stroke-[3px]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-[10px] py-1 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold border-none shadow-2xl">
                                Mark as Read
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>


          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};


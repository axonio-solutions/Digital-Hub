import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Archive,
  CircleUserRound,
  ClipboardList,
  Coins,
  Layers,
  Loader2,
  LogOut,
  Settings,
  Tag,
  Users,
} from 'lucide-react'
import { useSellerCreditBalance } from '@/features/seller/hooks/use-billing'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  ADMIN_ROUTES,
  AUTH_ROUTES,
  BUYER_ROUTES,
  DASHBOARD_ROUTES,
  SELLER_ROUTES,
} from '@/lib/routes'

interface UserMenuProps {
  user: any
  role?: string
  align?: 'start' | 'center' | 'end'
}

export function UserMenu({
  user,
  role = 'buyer',
  align = 'end',
}: UserMenuProps) {
  const { t, i18n } = useTranslation('dashboard/layout')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const creditQuery = useSellerCreditBalance()

  const name = user?.name || user?.email || ''
  const email = user?.email || ''
  const image = user?.image || ''
  const initials = name.substring(0, 2).toUpperCase()
  const toolsLabel =
    role === 'admin'
      ? t('user_dropdown.tools_admin')
      : role === 'seller'
        ? t('user_dropdown.tools_seller')
        : t('user_dropdown.tools_buyer')

  const roleLinks = useMemo(() => {
    if (role === 'admin') {
      return [
        {
          to: DASHBOARD_ROUTES.ROOT,
          label: t('nav.global_metrics'),
          icon: Activity,
        },
        {
          to: ADMIN_ROUTES.USERS,
          label: t('nav.user_moderation'),
          icon: Users,
        },
        {
          to: ADMIN_ROUTES.CATEGORIES,
          label: t('nav.categories'),
          icon: Layers,
        },
        {
          to: ADMIN_ROUTES.AUDIT_LOG,
          label: t('nav.request_audit'),
          icon: Archive,
        },
        {
          to: DASHBOARD_ROUTES.PROFILE,
          label: t('nav.admin_settings'),
          icon: Settings,
        },
      ]
    }
    if (role === 'seller') {
      return [
        { to: SELLER_ROUTES.QUOTES, label: t('nav.my_quotes'), icon: Tag },
        { to: SELLER_ROUTES.BILLING, label: t('nav.billing'), icon: Coins },
      ]
    }
    return [
      {
        to: BUYER_ROUTES.REQUESTS,
        label: t('user_dropdown.my_requests'),
        icon: ClipboardList,
      },
    ]
  }, [role, t])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      window.location.href = AUTH_ROUTES.LOGIN
    } catch {
      setIsLoggingOut(false)
    }
  }

  const itemClass =
    'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors hover:bg-muted group/item [dir=rtl]:justify-end'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative outline-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 group/avatar"
          aria-label={t('user_dropdown.open_menu')}
        >
          <Avatar className="size-8 rounded-full border-2 border-transparent group-hover/avatar:border-primary/30 transition-all duration-200">
            <AvatarImage src={image} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 end-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-background" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={8}
        dir={i18n.dir()}
        className="w-72 p-0 rounded-xl border-border bg-card shadow-lg overflow-hidden"
      >
        {/* Profile header */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 bg-muted/50 border-b border-border">
          <Avatar className="size-11 rounded-lg border border-border">
            <AvatarImage src={image} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground font-black rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {email}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center h-5 px-2 rounded-md text-[9px] font-black uppercase tracking-widest',
                  role === 'seller'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : role === 'admin'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                )}
              >
                {role === 'admin'
                  ? t('roles.admin', { ns: 'common' })
                  : role === 'seller'
                    ? t('roles.seller', { ns: 'common' })
                    : t('roles.buyer', { ns: 'common' })}
              </span>
              {role === 'seller' && (
                <span className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30">
                  <Coins className="size-3" />
                  {creditQuery.data?.balance ?? 0}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific links */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            {toolsLabel}
          </DropdownMenuLabel>
          {roleLinks.map((link) => (
            <DropdownMenuItem
              key={link.to}
              onClick={() => navigate({ to: link.to as any })}
              className={cn(itemClass, 'mx-2')}
            >
              <link.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
              <span className="flex-1 text-foreground">{link.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Account */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigate({ to: DASHBOARD_ROUTES.PROFILE })}
            className={cn(itemClass, 'mx-2')}
          >
            <CircleUserRound className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
            <span className="flex-1 text-foreground">
              {t('user_dropdown.account_settings')}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Sign Out */}
        <div className="p-2">
          <DropdownMenuItem
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={cn(
              itemClass,
              'rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive',
            )}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>{t('user_dropdown.sign_out')}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

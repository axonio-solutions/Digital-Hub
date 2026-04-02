import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  LogOut,
  Settings,
  CircleUserRound,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Store,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
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
import { cn } from "@/lib/utils"

import { Badge } from '@/components/ui/badge'

export function UserDropdown() {
  const { data: user } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const queryClient = useQueryClient()

  const name = user?.name || 'User'
  const email = user?.email || ''
  const initials = name.substring(0, 2).toUpperCase()
  const role = user?.role || 'buyer'
  const status = user?.account_status || 'active'
  const location = user?.wilaya ? `${user.city ? user.city + ', ' : ''}${user.wilaya}` : 'No location set'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed', error)
      setIsLoggingOut(false)
    }
  }

  const itemClass = "flex items-center gap-2 p-2.5 text-sm font-medium cursor-pointer rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900 group"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative outline-none group rounded-xl transition-colors">
          <Avatar className="size-9 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors group-hover:border-primary overflow-hidden">
            <AvatarImage src={user?.image || ''} alt={name} className="object-cover" />
            <AvatarFallback className="bg-slate-50 dark:bg-slate-900 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -end-0.5 z-10 size-2.5 bg-green-500 rounded-full border-2 border-background" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-none"
      >
        <div className="p-5 flex flex-col items-center text-center">
          <div className="relative mt-2">
            <Avatar className="size-24 rounded-full border border-slate-100 dark:border-slate-800 ring-4 ring-slate-50 dark:ring-slate-900 shadow-none transition-transform duration-300 hover:scale-105">
              <AvatarImage src={user?.image || ''} alt={name} className="object-cover" />
              <AvatarFallback className="bg-slate-50 dark:bg-slate-900 text-primary text-3xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-0.5 mb-3">
            <h3 className="text-base font-bold tracking-tight text-foreground leading-tight">
              {name}
            </h3>
            <p className="text-muted-foreground text-[11px] truncate max-w-[200px] font-medium">
              {email}
            </p>
          </div>


        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50" />

        <div className="p-3">
          <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800/50">
            <div className="flex flex-col items-center gap-0.5 px-2 group/item">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Role</span>
              <span className="text-xs font-semibold capitalize">{role}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2 group/item">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Region</span>
              <span className="text-xs font-semibold truncate">{user?.wilaya || 'N/A'}</span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={() => navigate({ to: '/dashboard/profile' })}
            className={cn(itemClass, "px-3 py-2.5 rounded-xl")}
          >
            <CircleUserRound size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
            <span className="flex-1">Account Settings</span>
          </DropdownMenuItem>

          {role === 'seller' && (
            <DropdownMenuItem
              onClick={() => navigate({ to: '/dashboard/seller' })}
              className={cn(itemClass, "px-3 py-2.5 rounded-xl")}
            >
              <Store size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="flex-1">Seller Hub</span>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50" />

        <div className="p-1 pb-1.5">
          <DropdownMenuItem
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={cn(itemClass, "px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30")}
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

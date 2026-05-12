import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  CircleUserRound,
  ClipboardList,
  Loader2,
  LogOut,
  Tag,
} from 'lucide-react'
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

const SELLER_LINKS = [
  { to: '/dashboard/quotes', label: 'My Quotes', icon: Tag },
]

const BUYER_LINKS = [
  { to: '/dashboard/requests', label: 'My Requests', icon: ClipboardList },
]

interface UserMenuProps {
  user: any
  role?: string
  align?: 'start' | 'center' | 'end'
}

export function UserMenu({ user, role = 'buyer', align = 'end' }: UserMenuProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const name = user?.name || user?.email || 'User'
  const email = user?.email || ''
  const image = user?.image || ''
  const initials = name.substring(0, 2).toUpperCase()
  const roleLinks = role === 'seller' ? SELLER_LINKS : BUYER_LINKS

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      window.location.href = '/login'
    } catch {
      setIsLoggingOut(false)
    }
  }

  const itemClass = "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors hover:bg-muted group/item"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative outline-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 group/avatar"
          aria-label="Open user menu"
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
            <p className="text-sm font-bold text-foreground truncate leading-tight">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{email}</p>
            <span className={cn(
              "inline-flex items-center mt-1.5 h-5 px-2 rounded-md text-[9px] font-black uppercase tracking-widest",
              role === 'seller'
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            )}>
              {role}
            </span>
          </div>
        </div>

        {/* Role-specific links */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            {role === 'seller' ? 'Seller Tools' : 'Buyer Tools'}
          </DropdownMenuLabel>
          {roleLinks.map((link) => (
            <DropdownMenuItem
              key={link.to}
              onClick={() => navigate({ to: link.to as any })}
              className={cn(itemClass, "mx-2")}
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
            onClick={() => navigate({ to: '/dashboard/profile' as any })}
            className={cn(itemClass, "mx-2")}
          >
            <CircleUserRound className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
            <span className="flex-1 text-foreground">Account Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Sign Out */}
        <div className="p-2">
          <DropdownMenuItem
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={cn(itemClass, "rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive")}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

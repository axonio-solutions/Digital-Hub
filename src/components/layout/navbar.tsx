import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useRouteContext, useRouterState } from '@tanstack/react-router'
import { Search, Settings2, X, ReceiptText, ClipboardList, Tag, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Loader2, LogOut, CircleUserRound, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// ── Seller nav links ───────────────────────────────────────────────────────
const SELLER_LINKS = [
  { to: '/dashboard', label: 'Marketplace Board', icon: LayoutDashboard },
  { to: '/dashboard/quotes', label: 'My Quotes', icon: Tag },
]

// ── Buyer nav links ────────────────────────────────────────────────────────
const BUYER_LINKS = [
  { to: '/dashboard/requests', label: 'My Requests', icon: ClipboardList },
  { to: '/dashboard/requests/new', label: 'Post a Request', icon: ReceiptText },
]

export default function Navbar() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const { data: user } = useAuth()
  const { user: ctxUser } = useRouteContext({ from: '__root__' })
  // Prefer live query data; fall back to route context snapshot
  const activeUser = user ?? ctxUser
  const isAuthenticated = !!activeUser

  const role: string =
    (activeUser as any)?.role ??
    (activeUser as any)?.user_metadata?.role ??
    (activeUser as any)?.app_metadata?.role ??
    'buyer'

  const name = (activeUser as any)?.name || (activeUser as any)?.email || 'User'
  const email = (activeUser as any)?.email || ''
  const image = (activeUser as any)?.image || ''
  const initials = name.substring(0, 2).toUpperCase()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  // ── Scroll-aware glass effect ─────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const roleLinks = role === 'seller' ? SELLER_LINKS : BUYER_LINKS
  const itemCls = "flex items-center gap-2.5 px-3 py-2 text-sm font-medium cursor-pointer rounded-lg transition-all"

  // Show search bar only on the explore page
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isExplorePage = pathname.startsWith('/explore')

  return (
    <header
      className={cn(
        // Base
        "sticky top-0 z-50 w-full h-16",
        "flex items-center px-6 lg:px-10 gap-6",
        // Glass morphism — intensifies on scroll
        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl",
        "border-b transition-all duration-300",
        scrolled
          ? "border-slate-200/80 dark:border-slate-800/80 shadow-[0_1px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_20px_-4px_rgba(0,0,0,0.4)]"
          : "border-transparent"
      )}
    >
      {/* ── LEFT: Brand ─────────────────────────────────────────────────────── */}
      <Link
        to="/"
        className="flex items-center gap-2.5 flex-shrink-0 group"
        aria-label="MLILA Home"
      >
        <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-200">
          <Settings2 className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-[17px] font-black tracking-tight text-slate-900 dark:text-white hidden sm:inline-block">
          M<span className="text-primary">-</span>Lila
        </span>
      </Link>

      {/* ── CENTER: Search — explore page only ───────────────────────────────── */}
      {isExplorePage ? (
        <>
          {/* Desktop wide search bar */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-primary/0 group-focus-within:bg-primary/5 blur-xl transition-all duration-500 pointer-events-none" />
              <div className={cn(
                "relative flex items-center h-10 rounded-full border transition-all duration-200",
                "bg-slate-50 dark:bg-slate-900",
                "border-slate-200 dark:border-slate-800",
                "focus-within:border-primary/40 dark:focus-within:border-primary/40",
                "focus-within:bg-white dark:focus-within:bg-slate-950",
                "focus-within:shadow-sm",
              )}>
                <Search className="ms-3.5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors flex-shrink-0" />
                <Input
                  id="global-search"
                  type="search"
                  placeholder="Search for spare parts, OEM numbers, brands…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && navigate({ to: '/explore', search: { q: searchQuery } as any })}
                  className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-slate-400 text-slate-900 dark:text-slate-100 h-10 px-2.5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="me-2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search icon */}
          <button
            className="md:hidden flex-1 flex items-center justify-end"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-slate-500" />
          </button>
        </>
      ) : (
        /* Spacer so right section stays pushed to the end on non-explore pages */
        <div className="flex-1" />
      )}

      {/* ── RIGHT: Controls ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />

        {isAuthenticated ? (
          <>
            {/* Role-based quick links — hidden on mobile */}
            <div className="hidden lg:flex items-center gap-1 me-1">
              {roleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to as any}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-all duration-200",
                    "text-slate-500 dark:text-slate-400",
                    "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80",
                  )}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Notification bell */}
            <NotificationBell />

            {/* Avatar + dropdown ───────────────────────────────────────────── */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-avatar-trigger"
                  className="relative outline-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 group"
                  aria-label="Open user menu"
                >
                  <Avatar className="size-9 rounded-full border-2 border-transparent group-hover:border-primary/50 transition-all duration-200 shadow-sm">
                    <AvatarImage src={image} alt={name} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-black">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-950 shadow-sm" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-72 p-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/60 overflow-hidden"
              >
                {/* ── Profile header ───────────────────────────────────────── */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                  <Avatar className="size-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <AvatarImage src={image} alt={name} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-black rounded-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">{name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
                    {/* Role pill */}
                    <span className={cn(
                      "inline-flex items-center mt-2 h-5 px-2 rounded-full text-[9px] font-black uppercase tracking-widest",
                      role === 'seller'
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    )}>
                      {role}
                    </span>
                  </div>
                </div>

                {/* ── Role-specific navigation ─────────────────────────────── */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                    {role === 'seller' ? 'Seller Tools' : 'Buyer Tools'}
                  </DropdownMenuLabel>
                  {roleLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.to}
                      onClick={() => navigate({ to: link.to as any })}
                      className={cn(itemCls, "mx-2 hover:bg-slate-50 dark:hover:bg-slate-900 group/item")}
                    >
                      <link.icon className="w-4 h-4 text-slate-400 group-hover/item:text-primary transition-colors" />
                      <span className="flex-1 text-slate-700 dark:text-slate-300">{link.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                {/* ── Common links ─────────────────────────────────────────── */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/dashboard/profile' as any })}
                    className={cn(itemCls, "mx-2 hover:bg-slate-50 dark:hover:bg-slate-900 group/item")}
                  >
                    <CircleUserRound className="w-4 h-4 text-slate-400 group-hover/item:text-primary transition-colors" />
                    <span className="flex-1 text-slate-700 dark:text-slate-300">Account Settings</span>
                  </DropdownMenuItem>

                  {role === 'seller' && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/dashboard' as any })}
                      className={cn(itemCls, "mx-2 hover:bg-slate-50 dark:hover:bg-slate-900 group/item")}
                    >
                      <Store className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                      <span className="flex-1 text-slate-700 dark:text-slate-300">Seller Hub</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                {/* ── Sign out ─────────────────────────────────────────────── */}
                <div className="p-2">
                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className={cn(itemCls, "rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600")}
                  >
                    {isLoggingOut
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <LogOut className="w-4 h-4" />
                    }
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          /* ── Logged-out state ─────────────────────────────────────────────── */
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className="h-9 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="h-9 px-5 text-sm font-bold rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:brightness-110 hover:shadow-primary/40 active:scale-95 transition-all duration-200"
            >
              <Link to="/register">Join Free</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Mobile full-screen search overlay ─────────────────────────────── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center h-16 px-4 gap-3 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search spare parts, OEM numbers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate({ to: '/explore', search: { q: searchQuery } as any })
                  setSearchOpen(false)
                }
              }}
              className="flex-1 bg-transparent text-base text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Could add search suggestions here in future */}
        </div>
      )}
    </header>
  )
}

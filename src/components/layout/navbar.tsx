import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationBell } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { NavControls } from '@/components/navigation/nav-controls'
import { UserMenu } from '@/components/navigation/user-menu'

const NAV_LINKS = [
  { to: '/explore', search: { q: '' }, label: 'Explore' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { data: user } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const role: string =
    (user as any)?.role ??
    (user as any)?.user_metadata?.role ??
    (user as any)?.app_metadata?.role ??
    'buyer'

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [currentPath])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-14',
        'flex items-center px-4 lg:px-8 gap-4',
        'bg-background/90 backdrop-blur-md',
        'border-b transition-all duration-300',
        scrolled
          ? 'border-border shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]'
          : 'border-transparent',
      )}
    >
      {/* Brand */}
      <Link
        to="/"
        className="flex items-center gap-2 flex-shrink-0 group select-none"
        aria-label="MLILA Home"
      >
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <span className="text-primary-foreground font-black text-[11px] leading-none tracking-tighter">M</span>
        </div>
        <span className="text-[15px] font-black tracking-tight text-foreground hidden sm:inline">
          MLILA
        </span>
      </Link>

      {/* Public Nav Links - Desktop */}
      <nav className="hidden md:flex items-center gap-0.5 ml-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to as any}
            search={(link as any).search}
            className={cn(
              'px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg hover:bg-muted',
              currentPath.startsWith(link.to)
                ? 'text-foreground bg-muted/60'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <NavControls showLanguage={false} />

        {isAuthenticated ? (
          <>
            <NotificationBell />
            <UserMenu user={user} role={role} />
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              asChild
              className="h-9 px-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:inline-flex"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="h-9 px-4 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97] transition-all duration-150"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </>
        )}

        {/* Mobile Menu Trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-9 rounded-xl"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="w-full sm:w-80 p-0 border-l border-border/60">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-border/60 shrink-0">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-black text-[11px]">M</span>
                  </div>
                  <span className="text-[15px] font-black tracking-tight">MLILA</span>
                </Link>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setMobileOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to as any}
                    search={(link as any).search}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center h-11 px-4 rounded-xl text-sm font-bold transition-all',
                      currentPath.startsWith(link.to)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bottom section */}
              <div className="border-t border-border/60 p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-center gap-3">
                  <NavControls showTheme />
                </div>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <UserMenu user={user} role={role} align="start" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{user?.name || user?.email || 'User'}</p>
                      <p className="text-[11px] text-muted-foreground truncate capitalize">{role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl text-sm font-bold">
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full h-11 rounded-xl text-sm font-bold">
                      <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

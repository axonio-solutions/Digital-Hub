import { useEffect, useMemo, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationBell } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { NavControls } from '@/components/navigation/nav-controls'
import { UserMenu } from '@/components/navigation/user-menu'

export default function Navbar() {
  const { t } = useTranslation('common')
  const { data: user } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const NAV_LINKS = useMemo(() => {
    const links: Array<{
      to: string
      search?: Record<string, unknown>
      label: string
      icon?: React.ReactNode
    }> = []
    if (isAuthenticated) {
      links.push({
        to: '/dashboard',
        label: t('nav.dashboard', 'Dashboard'),
        icon: <LayoutDashboard className="h-4 w-4" />,
      })
    }
    links.push(
      { to: '/explore', search: { q: '' }, label: t('nav.explore', 'Explore') },
      { to: '/pricing', label: t('nav.pricing', 'Pricing') },
      { to: '/about', label: t('nav.about', 'About') },
      { to: '/contact', label: t('nav.contact', 'Contact') },
    )
    return links
  }, [t, isAuthenticated])

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
        'sticky top-0 z-50 w-full transition-all duration-300',
        'bg-background/40 backdrop-blur-md',
        scrolled ? 'border-border' : 'border-transparent',
        'border-b',
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0 mr-4 lg:mr-8"
          aria-label="MLILA Home"
        >
          <img
            alt="MLILA"
            height={36}
            className="rounded-md"
            loading="eager"
            src="/logo192.png"
            style={{ height: 36, width: 'auto' }}
          />
          <span className="font-bold text-lg tracking-tight hidden sm:inline text-foreground">
            MLILA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to as any}
              search={(link as any).search}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors inline-flex items-center gap-1.5',
                currentPath.startsWith(link.to)
                  ? 'text-foreground'
                  : 'text-foreground/75 hover:text-foreground',
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <NavControls showLanguage={true} showTheme={true} />

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
                  className="h-8 rounded-md px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Link to="/login">
                    {t('nav.sign_in', 'Sign In')}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-8 rounded-md px-3 text-xs font-semibold shadow-md hover:shadow-lg bg-primary text-primary-foreground hover:bg-primary/92 hover:-translate-y-px transition-all"
                >
                  <Link to={'/register' as any}>
                    {t('nav.get_started', 'Get Started')}
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <NavControls showLanguage={true} showTheme={true} />
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-accent"
                  aria-label="Menu"
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                showCloseButton={false}
                className="w-full sm:w-80 p-0 border-l border-border/60"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-5 h-14 border-b border-border/60 shrink-0">
                    <Link
                      to="/"
                      className="flex items-center gap-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      <img
                        alt="MLILA"
                        height={28}
                        className="rounded-md"
                        src="/logo192.png"
                        style={{ height: 28, width: 'auto' }}
                      />
                      <span className="font-bold text-base tracking-tight text-foreground">
                        MLILA
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to as any}
                        search={(link as any).search}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 h-11 px-4 rounded-xl text-sm font-medium transition-all',
                          currentPath.startsWith(link.to)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-border/60 p-4 space-y-3 shrink-0">
                    <div className="flex items-center justify-center gap-3">
                      <NavControls showTheme />
                    </div>
                    {isAuthenticated ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <UserMenu user={user} role={role} align="start" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">
                            {user?.name || user?.email || 'User'}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate capitalize">
                            {role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full h-11 rounded-xl text-sm font-semibold"
                        >
                          <Link to="/login" onClick={() => setMobileOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full h-11 rounded-xl text-sm font-semibold"
                        >
                          <Link
                            to={'/register' as any}
                            onClick={() => setMobileOpen(false)}
                          >
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}



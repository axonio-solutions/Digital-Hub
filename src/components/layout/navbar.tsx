/* Hallmark · genre: modern-minimal · macrostructure: N5 floating pill (public) + sticky (app)
 * design-system: design.md · designed-as-app · date: 2026-05-21
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationBell } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { NavControls } from '@/components/navigation/nav-controls'
import { UserMenu } from '@/components/navigation/user-menu'

const PUBLIC_PATHS = ['/', '/about', '/contact', '/pricing', '/faq', '/explore']

export default function Navbar() {
  const { t } = useTranslation('common')
  const { data: user } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const isPublicPage = PUBLIC_PATHS.some(
    (p) => currentPath === p || currentPath.startsWith('/explore'),
  )

  const NAV_LINKS = useMemo(
    () => [
      { to: '/explore', search: { q: '' }, label: t('nav.explore', 'Explore') },
      { to: '/pricing', label: t('nav.pricing', 'Pricing') },
      { to: '/faq', label: t('nav.faq', 'FAQ') },
      { to: '/about', label: t('nav.about', 'About') },
      { to: '/contact', label: t('nav.contact', 'Contact') },
    ],
    [t],
  )

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

  if (isPublicPage) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
        <nav
          className={cn(
            'pointer-events-auto flex items-center gap-1 pl-3 pr-2 py-2',
            'rounded-full border border-border',
            'bg-background/85 backdrop-blur-[14px] saturate-150',
            'shadow-[0_4px_24px_-8px_oklch(0%_0_0_/_0.12)]',
            'dark:shadow-[0_4px_24px_-8px_oklch(0%_0_0_/_0.4)]',
            'w-full max-w-3xl transition-shadow duration-300',
            scrolled &&
              'shadow-[0_6px_32px_-8px_oklch(0%_0_0_/_0.18)] dark:shadow-[0_6px_32px_-8px_oklch(0%_0_0_/_0.5)]',
          )}
          aria-label="Primary"
        >
          {/* Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 select-none px-2 py-1 rounded-full hover:bg-muted/60 transition-colors"
            aria-label="MLILA Home"
          >
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] leading-none tracking-tighter">
                M
              </span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-foreground hidden sm:inline">
              MLILA
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden md:block w-px h-4 bg-border mx-1 flex-shrink-0" />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                search={(link as any).search}
                className={cn(
                  'px-3 py-1.5 text-[13px] font-medium transition-colors rounded-full whitespace-nowrap',
                  currentPath.startsWith(link.to) && link.to !== '/'
                    ? 'text-foreground bg-muted/70'
                    : currentPath === '/' && link.to === '/'
                      ? 'text-foreground bg-muted/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Right controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <NavControls showLanguage={true} />

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
                  className="h-8 px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full hidden sm:inline-flex"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="h-8 px-4 text-[13px] font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all duration-150"
                >
                  <Link to={'/register' as any}>Get Started</Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-8 rounded-full hover:bg-muted/50"
                  aria-label="Open menu"
                >
                  {mobileOpen ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </Button>
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
                      <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-[10px]">
                          M
                        </span>
                      </div>
                      <span className="text-[15px] font-semibold tracking-tight">
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
                          'flex items-center h-11 px-4 rounded-xl text-sm font-medium transition-all',
                          currentPath.startsWith(link.to)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
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
                          <Link
                            to="/login"
                            onClick={() => setMobileOpen(false)}
                          >
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
        </nav>
      </header>
    )
  }

  // App pages — sticky header (unchanged behavior)
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
      <Link
        to="/"
        className="flex items-center gap-2 flex-shrink-0 group select-none"
        aria-label="MLILA Home"
      >
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <span className="text-primary-foreground font-bold text-[11px] leading-none tracking-tighter">
            M
          </span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground hidden sm:inline">
          MLILA
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-0.5 ml-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to as any}
            search={(link as any).search}
            className={cn(
              'px-3 py-1.5 text-[13px] font-medium transition-colors rounded-lg hover:bg-muted',
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

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <NavControls showLanguage={true} />

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
              className="h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:inline-flex"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="h-9 px-4 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97] transition-all duration-150"
            >
              <Link to={'/register' as any}>Get Started</Link>
            </Button>
          </>
        )}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'md:hidden size-9 rounded-xl',
                currentPath.startsWith('/explore') && 'hidden',
              )}
              aria-label="Open menu"
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
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
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-[11px]">
                      M
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold tracking-tight">
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
                      'flex items-center h-11 px-4 rounded-xl text-sm font-medium transition-all',
                      currentPath.startsWith(link.to)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
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
    </header>
  )
}

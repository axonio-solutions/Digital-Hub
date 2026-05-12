import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/features/notifications'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { NavControls } from '@/components/navigation/nav-controls'
import { UserMenu } from '@/components/navigation/user-menu'

export default function Navbar() {
  const { data: user } = useAuth()
  const isAuthenticated = !!user

  const role: string =
    (user as any)?.role ??
    (user as any)?.user_metadata?.role ??
    (user as any)?.app_metadata?.role ??
    'buyer'

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <NavControls />

        {isAuthenticated ? (
          <>
            <NotificationBell />
            <UserMenu user={user} role={role} />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className="h-9 px-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="h-9 px-4 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97] transition-all duration-150"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Header() {
  return (
    <>
      <header className="px-10 h-20 flex items-center justify-between bg-background border-b border-border shadow-sm transition-all duration-300">
        <div className="flex items-center gap-12">
          <Link to="/" className="group flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl rotate-[-4deg] group-hover:rotate-0 transition-transform shadow-lg shadow-primary/20">
              <img
                src="/tanstack-word-logo-white.svg"
                alt="TanStack Logo"
                className="h-6 filter brightness-0 invert"
              />
            </div>
            <span className="text-xl font-black text-foreground uppercase tracking-tighter">
              Digital <span className="text-primary italic">Hub</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <NotificationDropdown 
            trigger={
              <Button variant="ghost" size="icon" className="relative size-10 rounded-xl bg-muted border border-border hover:bg-accent transition-all group">
                <Bell className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute top-2 end-2 size-2 bg-primary rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
              </Button>
            }
          />
          
          <div className="h-8 w-[1px] bg-border mx-2" />
          
          <div className="flex items-center gap-3 ps-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/20" />
          </div>
        </div>
      </header>
    </>
  )
}

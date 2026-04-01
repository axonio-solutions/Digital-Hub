import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import NotificationDropdown from '@/features/notifications/components/notification-dropdown'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <>
      <header className="px-10 h-20 flex items-center justify-between bg-white dark:bg-card border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-12">
          <Link to="/" className="group flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl rotate-[-4deg] group-hover:rotate-0 transition-transform shadow-lg shadow-primary/20">
              <img
                src="/tanstack-word-logo-white.svg"
                alt="TanStack Logo"
                className="h-6 filter brightness-0 invert"
              />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Digital <span className="text-primary italic">Hub</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown 
            trigger={
              <Button variant="ghost" size="icon" className="relative size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <Bell className="size-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
              </Button>
            }
          />
          
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
          
          <div className="flex items-center gap-3 pl-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/20" />
          </div>
        </div>
      </header>
    </>
  )
}

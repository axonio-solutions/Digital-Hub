import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { authClient } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function UserDropdown() {
  const { data: user } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const queryClient = useQueryClient()

  // Determine display label, depending on what better-auth provides (name, or phone)
  const displayLabel = user?.name || user?.email || "User"
  const initials = displayLabel.substring(0, 2).toUpperCase()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // 1. Physically destroy the secure session on the server and client
      await authClient.signOut()
      // 2. Annihilate the active TanStack Query authenticated cache to prevent state bleeding
      queryClient.clear()
      // 3. Hard-reload the browser context entirely to obliterate any lingering in-memory identity
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border bg-background">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayLabel}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user?.role === 'admin' ? 'Admin Account' : user?.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/profile" })} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 hover:text-red-500" disabled={isLoggingOut}>
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

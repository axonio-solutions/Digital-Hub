'use client'

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet"

interface ExploreLayoutProps {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
  isMobileFilterOpen: boolean
  setIsMobileFilterOpen: (open: boolean) => void
}

export function ExploreLayout({
  sidebar,
  header,
  children,
  isMobileFilterOpen,
  setIsMobileFilterOpen
}: ExploreLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1700px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          
          {/* Desktop Sidebar - Sticky */}
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-28 h-[calc(100vh-120px)] pr-4 overflow-y-auto premium-scrollbar">
              {sidebar}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <header className="mb-10">
              {header}
            </header>
            
            <main>
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <SheetContent side="left" className="w-[320px] p-0 border-none bg-white dark:bg-slate-950">
          <SheetHeader className="p-6 pb-0 sr-only">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Adjust your marketplace preferences</SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto p-6 pt-10">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

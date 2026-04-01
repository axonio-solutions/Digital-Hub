'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  contentClassName?: string
}

export function Modal({
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  className,
  contentClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[600px] rounded-[3rem] border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] p-0 overflow-hidden bg-white dark:bg-slate-950 transition-all",
        className
      )}>
        <div className="p-8 md:p-12 pb-4">
          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm font-medium text-slate-500 italic mt-2 leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className={cn("p-8 md:p-12 pt-0", contentClassName)}>
          {children}
        </div>

        {footer && (
          <DialogFooter className="p-8 md:p-12 pt-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'primary' | 'success' | 'blue'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max(0, value), max)
    
    const variants = {
      default: "bg-primary shadow-[0_0_20px_0_rgba(0,0,0,0.15)]",
      primary: "bg-primary shadow-[0_0_20px_0_hsl(var(--primary)/0.3)]",
      success: "bg-emerald-500 shadow-[0_0_20px_0_rgba(16,185,129,0.3)]",
      blue: "bg-blue-500 shadow-[0_0_20px_0_rgba(59,130,246,0.3)]",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn("h-full rounded-full transition-all", variants[variant])}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        {showLabel && (
          <div className="absolute inset-x-0 -top-6 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500/80">
            <span>Sync Stats</span>
            <span>{percentage}%</span>
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }

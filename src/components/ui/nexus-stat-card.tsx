import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NexusStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: string
  isPrimary?: boolean
  color?: "blue" | "indigo" | "rose" | "emerald" | "slate"
}

export function NexusStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isPrimary,
  color = "slate"
}: NexusStatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    slate: "bg-slate-50 border-slate-100 text-slate-500",
  }

  return (
    <div className={cn(
      "p-6 rounded-2xl border bg-white shadow-sm flex flex-col justify-between h-full transition-all duration-200",
      isPrimary ? "border-primary/20 ring-1 ring-primary/5 shadow-md shadow-primary/5" : "border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "size-10 rounded-xl flex items-center justify-center border",
          isPrimary ? "bg-primary/10 border-primary/20 text-primary" : colorClasses[color]
        )}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trend}</div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{title}</p>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground font-medium mt-3 leading-tight opacity-70">{description}</p>
      )}
    </div>
  )
}

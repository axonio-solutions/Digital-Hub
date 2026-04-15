"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const glowingBadgeVariants = cva(
  "relative inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all duration-300 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
        warning: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
        error: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
        info: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
        neutral: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const dotVariants = cva("size-1.5 rounded-full shrink-0", {
  variants: {
    variant: {
      default: "bg-slate-400",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      neutral: "bg-gray-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pulseVariants = cva("absolute inset-0 rounded-full opacity-40", {
    variants: {
      variant: {
        default: "bg-slate-400",
        success: "bg-emerald-400",
        warning: "bg-amber-400",
        error: "bg-red-400",
        info: "bg-blue-400",
        neutral: "bg-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });

export interface GlowingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowingBadgeVariants> {
  pulse?: boolean;
  dot?: boolean;
}

function GlowingBadge({
  className,
  variant,
  pulse = true,
  dot = true,
  children,
  ...props
}: GlowingBadgeProps) {
  return (
    <div
      className={cn(glowingBadgeVariants({ variant }), className)}
      {...props}
    >
      {pulse && (
        <motion.div
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className={cn(pulseVariants({ variant }))}
        />
      )}
      {dot && <div className={cn(dotVariants({ variant }))} />}
      <span className="relative z-10">{children}</span>
    </div>
  );
}

export { GlowingBadge, glowingBadgeVariants };

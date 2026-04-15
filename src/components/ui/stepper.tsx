'use client'

import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Array<Step>
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  completedSteps?: Array<number>
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  className,
}: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute left-[5%] right-[5%] top-[1.25rem] h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative z-10"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  'relative flex flex-col items-center group transition-all duration-300',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
                )}
              >
                {/* Active Glow Ring */}
                {isCurrent && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute -inset-2 rounded-full bg-primary/20 blur-md"
                    transition={{ duration: 0.5, type: 'spring' }}
                  />
                )}

                <motion.div
                  initial={false}
                  animate={{
                    borderColor: isCompleted || isCurrent ? 'var(--color-primary)' : 'transparent',
                    backgroundColor: isCompleted
                      ? 'var(--color-primary)'
                      : isCurrent
                        ? 'var(--color-background)'
                        : 'var(--color-slate-100)',
                  }}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 relative z-10 transition-shadow',
                    !isCompleted && !isCurrent && 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700',
                    isCurrent && 'shadow-[0_0_15px_rgba(var(--color-primary),0.5)] bg-white dark:bg-slate-950',
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-bold',
                        isCurrent
                          ? 'text-primary'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                
                <div className="mt-3 text-center absolute top-full w-32 -ml-16 left-1/2">
                  <p
                    className={cn(
                      'text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-300',
                      isCurrent
                        ? 'text-primary'
                        : isCompleted 
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500',
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
            </div>
          )
        })}

        {/* Animated Progress Fill Line */}
        <div className="absolute left-[5%] right-[5%] top-[1.25rem] h-1 -z-10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${(Math.max(0, currentStep) / Math.max(1, steps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// --- Context ---

interface OnboardingContextValue {
  currentStep: number
  totalSteps: number
  setCurrentStep: (step: number) => void
  stepValue: number
  setStepValue: (value: number) => void
  direction: number
  handleNext: () => void
  handleBack: () => void
  canGoNext: (step: number) => boolean
  onComplete?: () => void
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(
  null,
)

export function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an Onboarding provider')
  }
  return context
}

// --- Main Components ---

interface OnboardingProps {
  children: React.ReactNode
  totalSteps: number
  currentStep?: number
  onStepChange?: (step: number) => void
  canGoNext?: (step: number) => boolean
  onComplete?: () => void
  maxStepValue?: number
  className?: string
}

export function Onboarding({
  children,
  totalSteps,
  currentStep: controlledStep,
  onStepChange,
  canGoNext = () => true,
  onComplete,
  className,
}: OnboardingProps) {
  const [internalStep, setInternalStep] = React.useState(1)
  const [stepValue, setStepValue] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const currentStep = controlledStep ?? internalStep

  const handleNext = React.useCallback(() => {
    if (currentStep < totalSteps) {
      if (canGoNext(currentStep)) {
        setDirection(1)
        const nextStep = currentStep + 1
        if (!controlledStep) setInternalStep(nextStep)
        onStepChange?.(nextStep)
        setStepValue(0) // Reset secondary step value when moving main steps
      }
    } else {
      onComplete?.()
    }
  }, [
    currentStep,
    totalSteps,
    canGoNext,
    controlledStep,
    onStepChange,
    onComplete,
  ])

  const handleBack = React.useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1)
      const prevStep = currentStep - 1
      if (!controlledStep) setInternalStep(prevStep)
      onStepChange?.(prevStep)
      setStepValue(0)
    }
  }, [currentStep, controlledStep, onStepChange])

  const value = React.useMemo(
    () => ({
      currentStep,
      totalSteps,
      setCurrentStep: (s: number) => {
        setDirection(s > currentStep ? 1 : -1)
        if (!controlledStep) setInternalStep(s)
        onStepChange?.(s)
      },
      stepValue,
      setStepValue,
      direction,
      handleNext,
      handleBack,
      canGoNext,
      onComplete,
    }),
    [
      currentStep,
      totalSteps,
      stepValue,
      direction,
      handleNext,
      handleBack,
      canGoNext,
      onComplete,
      controlledStep,
      onStepChange,
    ],
  )

  return (
    <OnboardingContext.Provider value={value}>
      <div className={cn('relative flex flex-col', className)}>
        <div className="flex-1 min-h-[420px] flex flex-col">{children}</div>
      </div>
    </OnboardingContext.Provider>
  )
}

// --- Subcomponents ---

Onboarding.Step = function OnboardingStep({
  step,
  children,
}: {
  step: number
  children: React.ReactNode
}) {
  const { currentStep, direction } = useOnboarding()

  if (currentStep !== step) return null

  return (
    <motion.div
      initial={{ x: direction > 0 ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction < 0 ? 20 : -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

Onboarding.StepIndicator = function OnboardingStepIndicator() {
  const { currentStep, totalSteps } = useOnboarding()

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            currentStep === i + 1
              ? 'w-8 bg-primary'
              : 'w-2 bg-muted-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

Onboarding.Navigation = function OnboardingNavigation({
  completeLabel = 'Complete',
  backLabel = 'Back',
  nextLabel = 'Continue',
}: {
  completeLabel?: string
  backLabel?: string
  nextLabel?: string
}) {
  const { currentStep, totalSteps, handleNext, handleBack, canGoNext } =
    useOnboarding()
  const isLast = currentStep === totalSteps
  const canContinue = canGoNext(currentStep)

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50 mt-auto bg-card/50 backdrop-blur-sm p-3 rounded-xl">
      <Button
        variant="ghost"
        onClick={handleBack}
        disabled={currentStep === 1}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {backLabel}
      </Button>

      <Button
        onClick={handleNext}
        disabled={!canContinue}
        className={cn(
          'min-w-32 transition-all duration-300',
          isLast
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            : '',
        )}
      >
        {isLast ? completeLabel : nextLabel}
        {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
}

// --- ChoiceGroup ---

interface ChoiceGroupProps {
  children: React.ReactNode
  value: string | null
  onValueChange: (value: string) => void
  className?: string
  orientation?: 'grid' | 'horizontal' | 'vertical'
  name?: string
}

export function ChoiceGroup({
  children,
  value,
  onValueChange,
  className,
  orientation = 'grid',
}: ChoiceGroupProps) {
  return (
    <div
      className={cn(
        orientation === 'grid'
          ? 'grid grid-cols-2 gap-3'
          : 'flex flex-col gap-2',
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeValue: value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

ChoiceGroup.Item = function ChoiceGroupItem({
  value,
  children,
  className,
  activeValue,
  onValueChange,
}: {
  value: string
  children: React.ReactNode
  className?: string
  activeValue?: string | null
  onValueChange?: (v: string) => void
}) {
  const isSelected = activeValue === value
  return (
    <div
      onClick={() => onValueChange?.(value)}
      className={cn('relative group cursor-pointer overflow-hidden', className)}
    >
      {children}
      {isSelected && (
        <motion.div
          layoutId="choice-check"
          className="absolute top-2 right-2 size-4 bg-primary rounded-full flex items-center justify-center"
        >
          <Check className="size-2.5 text-white" />
        </motion.div>
      )}
    </div>
  )
}

// --- FeatureCarousel ---

interface FeatureCarouselProps {
  children: React.ReactNode
  value: number
  onValueChange: (value: number) => void
  totalItems: number
  className?: string
}

export function FeatureCarousel({
  children,
  value,
  onValueChange,
  className,
}: FeatureCarouselProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeValue: value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

FeatureCarousel.Item = function FeatureCarouselItem({
  index,
  children,
  activeValue,
  onValueChange,
}: {
  index: number
  children: React.ReactNode
  activeValue?: number
  onValueChange?: (v: number) => void
}) {
  const isActive = activeValue === index
  return (
    <div onClick={() => onValueChange?.(index)} className="cursor-pointer">
      {children}
    </div>
  )
}

// --- TipsList ---

export function TipsList({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <h4
        data-slot="tips-list-title"
        className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
      >
        {title}
      </h4>
      <div data-slot="tips-list-items" className="space-y-4">
        {children}
      </div>
    </div>
  )
}

TipsList.Item = function TipsListItem({
  number,
  children,
  className,
}: {
  number: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex gap-4 items-start', className)}>
      <span
        data-slot="tips-list-item-number"
        className="flex-shrink-0 size-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
      >
        {number}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

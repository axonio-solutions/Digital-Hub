'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// Steps
import { PartDetailsStep } from './wizard-steps/part-details-step-new'
import { CategoryStep } from './wizard-steps/category-step-new'
import { BrandStep } from './wizard-steps/brand-step-new'
import { VehicleInfoStep } from './wizard-steps/vehicle-info-step-new'
import { PhotosStep } from './wizard-steps/photos-step-new'
import { ReviewStep } from './wizard-steps/review-step-new'

// Hooks & Types
import { useCreateRequest } from '../hooks/use-requests'
import type { ProductFormData } from '@/types/product-schemas'
import { productFormSchema } from '@/types/product-schemas'
import { useAuth } from '@/features/auth/hooks/use-auth'

// UI Components
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface RequestWizardProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const STEPS = [
  { id: 1, title: 'Part Details', description: 'What part do you need?' },
  { id: 2, title: 'Category', description: 'Select a category' },
  { id: 3, title: 'Brand', description: 'Pick your vehicle brand' },
  { id: 4, title: 'Vehicle Info', description: 'Add model and year' },
  { id: 5, title: 'Photos', description: 'Upload images (optional)' },
  { id: 6, title: 'Review', description: 'Confirm and publish' },
]

export function RequestWizard({ onSuccess, onCancel }: RequestWizardProps) {
  const { t } = useTranslation('requests/form')
  const { data: user } = useAuth()
  const createRequest = useCreateRequest()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      partName: '',
      description: '',
      status: 'published',
      vehicleBrand: '',
      vehicleModel: '',
      modelYear: '',
      vinNumber: '',
      categoryId: '',
      brandId: '',
      imageUrls: [],
    },
    mode: 'onChange',
  })

  const { watch } = methods
  const formData = watch()

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.partName?.trim()
      case 2:
        return !!formData.categoryId
      case 3:
        return !!formData.brandId
      case 4:
        return !!formData.vehicleModel?.trim() && !!formData.modelYear?.trim()
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length && isStepComplete(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmitFinal = async () => {
    if (!user?.id) {
      toast.error(t('toasts.login_required'))
      return
    }

    setIsSubmitting(true)
    const values = methods.getValues()

    const payload = {
      buyerId: user.id,
      partName: values.partName,
      categoryId: values.categoryId,
      brandId: values.brandId,
      vehicleBrand: values.vehicleBrand,
      modelYear: `${values.vehicleModel} ${values.modelYear}`,
      notes: values.description,
      status: values.status === 'draft' ? 'draft' : 'open',
      imageUrls: values.imageUrls || [],
    }

    try {
      await createRequest.mutateAsync(payload)
      setIsSuccess(true)
      toast.success(t('toasts.create_success'))
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || t('toasts.process_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = Math.round((currentStep / STEPS.length) * 100)
  const canProceed = isStepComplete(currentStep)
  const isLastStep = currentStep === STEPS.length

  if (isSuccess) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="size-10 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Request Submitted!</h2>
          <p className="mb-6 text-muted-foreground">
            Your part request has been published successfully. Sellers will now be able to view and respond to your request.
          </p>
          <Button
            onClick={() => {
              onSuccess?.()
            }}
            size="lg"
            className="gap-2"
          >
            <Sparkles className="size-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <div className="hidden sm:flex w-64 flex-col border-r bg-muted/30">
          <div className="p-5 border-b">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">New Request</DialogTitle>
              <DialogDescription className="text-xs">
                Create a part request
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Step List */}
          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              const isComplete = isStepComplete(step.id)

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep || isComplete) {
                      setCurrentStep(step.id)
                    }
                  }}
                  disabled={step.id > currentStep && !isComplete}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-all',
                    isActive && 'bg-background shadow-sm font-medium',
                    isCompleted && 'text-muted-foreground hover:bg-muted/50',
                    !isActive && !isCompleted && 'text-muted-foreground/50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isActive && 'border-primary text-primary',
                      !isActive && !isCompleted && 'border-muted-foreground/20'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="truncate">{step.title}</span>
                </button>
              )
            })}
          </div>

          {/* Progress & Cancel */}
          <div className="border-t p-4 space-y-3">
            <div className="space-y-1.5">
              <Progress value={progress} className="h-1.5" variant="primary" />
              <p className="text-xs text-muted-foreground text-center">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="w-full text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Mobile header */}
          <div className="border-b bg-muted/20 p-3 sm:hidden">
            <DialogHeader>
              <DialogTitle className="text-base">
                {STEPS[currentStep - 1].title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Step {currentStep} of {STEPS.length}
              </DialogDescription>
            </DialogHeader>
            <Progress value={progress} className="mt-2 h-1" variant="primary" />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {currentStep === 1 && <PartDetailsStep />}
            {currentStep === 2 && <CategoryStep />}
            {currentStep === 3 && <BrandStep />}
            {currentStep === 4 && <VehicleInfoStep />}
            {currentStep === 5 && <PhotosStep />}
            {currentStep === 6 && <ReviewStep onEditStep={(i) => setCurrentStep(i + 1)} />}
          </div>

          {/* Navigation */}
          <div className="border-t bg-muted/10 p-3">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                size="sm"
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Publish Request
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  size="sm"
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

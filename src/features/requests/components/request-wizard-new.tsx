'use client'

import { useCallback, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// Steps
import { useCreateRequest, useUpdateRequest } from '../hooks/use-requests'
import { PartDetailsStep } from './wizard-steps/part-details-step-new'
import { CategoryStep } from './wizard-steps/category-step-new'
import { BrandStep } from './wizard-steps/brand-step-new'
import { VehicleInfoStep } from './wizard-steps/vehicle-info-step-new'
import { PhotosStep } from './wizard-steps/photos-step-new'
import { ReviewStep } from './wizard-steps/review-step-new'

// Hooks & Types
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
  initialData?: any
}

export function RequestWizard({ onSuccess, onCancel, initialData }: RequestWizardProps) {
  const { t, i18n } = useTranslation('requests/form')
  const isRtl = i18n.dir() === 'rtl'

  const STEPS = [
    { id: 1, title: t('steps.part_details.title'), description: t('steps.part_details.description') },
    { id: 2, title: t('steps.category.title'), description: t('steps.category.description') },
    { id: 3, title: t('steps.brand.title'), description: t('steps.brand.description') },
    { id: 4, title: t('steps.vehicle_info.title'), description: t('steps.vehicle_info.description') },
    { id: 5, title: t('steps.photos.title'), description: t('steps.photos.description') },
    { id: 6, title: t('steps.review.title'), description: t('steps.review.description') },
  ]
  const { data: user } = useAuth()
  const createRequest = useCreateRequest()
  const updateRequest = useUpdateRequest()
  const isEditing = !!initialData

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      partName: initialData?.partName || '',
      description: initialData?.notes || '',
      status: initialData ? (initialData?.status || 'open') : 'published',
      vehicleBrand: initialData?.vehicleBrand || '',
      vehicleModel: initialData?.modelYear ? initialData.modelYear.split(' ')[0] : '',
      modelYear: initialData?.modelYear ? initialData.modelYear.split(' ').slice(1).join(' ') : '',
      categories: initialData?.category ? [initialData.category.name] : [],
      categoryId: initialData?.categoryId || undefined,
      brandId: initialData?.brandId || undefined,
      tags: [],
      variations: [],
      expectedPrice: '',
      budgetType: 'negotiable',
      template: 'default',
      imageUrls: initialData?.imageUrls || [],
    },
    mode: 'onChange',
  })

  const watchPartName = methods.watch('partName')
  const watchCategoryId = methods.watch('categoryId')
  const watchBrandId = methods.watch('brandId')
  const watchVehicleModel = methods.watch('vehicleModel')
  const watchModelYear = methods.watch('modelYear')

  const isStepComplete = useCallback((step: number) => {
    switch (step) {
      case 1:
        return !!(watchPartName || '').trim()
      case 2:
        return !!watchCategoryId
      case 3:
        return !!watchBrandId
      case 4:
        return !!(watchVehicleModel || '').trim() && !!(watchModelYear || '').trim()
      default:
        return true
    }
  }, [watchPartName, watchCategoryId, watchBrandId, watchVehicleModel, watchModelYear])

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
      status: 'open',
      imageUrls: values.imageUrls || [],
    }

    try {
      if (isEditing && initialData?.id) {
        await updateRequest.mutateAsync({ id: initialData.id, payload })
        toast.success(t('toasts.update_success'))
      } else {
        await createRequest.mutateAsync(payload)
        toast.success(t('toasts.create_success'))
      }
      setIsSuccess(true)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || t('toasts.process_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contentRef = useRef<HTMLDivElement>(null)

  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [])

  const progress = Math.round((currentStep / STEPS.length) * 100)
  const canProceed = isStepComplete(currentStep)
  const isLastStep = currentStep === STEPS.length

  if (isSuccess) {
    return (
      <div className="flex h-dvh max-h-[85dvh] w-full items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="size-10 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">
            {isEditing ? t('wizard.success.updated_title') : t('wizard.success.submitted_title')}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {isEditing
              ? t('wizard.success.updated_desc')
              : t('wizard.success.submitted_desc')
            }
          </p>
          <Button
            onClick={() => {
              onSuccess?.()
            }}
            size="lg"
            className="gap-2"
          >
            <Sparkles className="size-4" />
            {t('wizard.back_to_dashboard')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="flex h-dvh max-h-[85dvh] w-full">
        {/* Sidebar */}
        <div className="hidden sm:flex w-64 flex-col border-r bg-muted/30">
          <div className="p-5 border-b">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{isEditing ? t('wizard.header.edit_title') : t('wizard.header.title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing ? t('wizard.header.edit_desc') : t('wizard.header.desc')}
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
                {t('wizard.step_progress', { current: currentStep, total: STEPS.length })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="w-full text-xs"
            >
              {t('wizard.cancel')}
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
                {t('wizard.step_progress', { current: currentStep, total: STEPS.length })}
              </DialogDescription>
            </DialogHeader>
            <Progress value={progress} className="mt-2 h-1" variant="primary" />
          </div>

          {/* Step Content */}
          <div
            ref={contentRef}
            onFocus={handleInputFocus}
            style={{ scrollPaddingBottom: '120px' }}
            className="flex-1 overflow-y-auto p-5"
          >
            {currentStep === 1 && <PartDetailsStep />}
            {currentStep === 2 && <CategoryStep />}
            {currentStep === 3 && <BrandStep />}
            {currentStep === 4 && <VehicleInfoStep />}
            {currentStep === 5 && <PhotosStep />}
            {currentStep === 6 && <ReviewStep onEditStep={(i) => setCurrentStep(i + 1)} />}
          </div>

          {/* Navigation */}
          <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                size="sm"
                className="gap-1"
              >
                {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                {t('wizard.back')}
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
                      {t('wizard.publishing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      {t('wizard.publish_btn')}
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
                  {t('wizard.next')}
                  {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

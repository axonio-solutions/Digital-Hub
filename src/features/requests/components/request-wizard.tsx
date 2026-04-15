'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// Steps
import { PartDetailsStep } from './wizard-steps/part-details-step'
import { CategoryStep } from './wizard-steps/category-step'
import { BrandStep } from './wizard-steps/brand-step'
import { VehicleInfoStep } from './wizard-steps/vehicle-info-step'
import { PhotosStep } from './wizard-steps/photos-step'
import { ReviewStep } from './wizard-steps/review-step'

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
import { Onboarding } from '@/components/ui/onboarding'
import { cn } from '@/lib/utils'

interface RequestWizardProps {
  onSuccess?: () => void
  onCancel?: () => void
}


export function RequestWizard({ onSuccess, onCancel }: RequestWizardProps) {
  const { t } = useTranslation('requests/form')
  const { data: user } = useAuth()
  const createRequest = useCreateRequest()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const { trigger, getValues, watch } = methods

  const isStepComplete = (step: number) => {
    const formData = watch()
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

  const handleSubmitFinal = async () => {
    if (!user?.id) {
      toast.error(t('toasts.login_required'))
      return
    }

    setIsSubmitting(true)
    const formData = getValues()

    const payload = {
      buyerId: user.id,
      partName: formData.partName,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      vehicleBrand: formData.vehicleBrand,
      modelYear: `${formData.vehicleModel} ${formData.modelYear}`,
      notes: formData.description,
      status: formData.status === 'draft' ? 'draft' : 'open',
      imageUrls: formData.imageUrls || [],
    }

    try {
      await createRequest.mutateAsync(payload)
      toast.success(t('toasts.create_success'))
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || t('toasts.process_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    {
      title: t('wizard.config.part_details_title'),
      description: t('wizard.config.part_details_desc'),
      icon: '📝',
    },
    {
      title: t('wizard.config.category_title'),
      description: t('wizard.config.category_desc'),
      icon: '📂',
    },
    {
      title: t('wizard.config.brand_title'),
      description: t('wizard.config.brand_desc'),
      icon: '🏭',
    },
    {
      title: t('wizard.config.vehicle_specs_title'),
      description: t('wizard.config.vehicle_specs_desc'),
      icon: '🚗',
    },
    {
      title: t('wizard.config.add_media_title'),
      description: t('wizard.config.add_media_desc'),
      icon: '📸',
    },
    {
      title: t('wizard.config.final_review_title'),
      description: t('wizard.config.final_review_desc'),
      icon: '✨',
    },
  ]

  const config = steps[currentStep - 1]
  const progress = Math.round((currentStep / steps.length) * 100)

  return (
    <FormProvider {...methods}>
      <Onboarding
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        canGoNext={(s) => isStepComplete(s)}
        onComplete={handleSubmitFinal}
        className="w-full h-full flex flex-col"
      >
        {/* Premium Header with Progress */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4 sm:p-5 border border-primary/10 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />

          <DialogHeader className="relative z-10 !text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-2xl">{config.icon}</span>
              <DialogTitle className="font-bold text-xl sm:text-2xl tracking-tight text-foreground">
                {config.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
              {config.description}
            </DialogDescription>

            {/* Enhanced Progress Bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{t('wizard.step_progress', { current: currentStep, total: steps.length })}</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" />
                  {t('wizard.complete_percent', { percent: progress })}
                </span>
              </div>
              <div className="h-1.5 bg-background/50 rounded-full overflow-hidden backdrop-blur-sm border border-primary/10">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Indicator Dots */}
            <div className="pt-2">
              <Onboarding.StepIndicator />
            </div>
          </DialogHeader>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 py-3 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>
            <AnimatePresence mode="wait">
              <Onboarding.Step step={1}>
                <PartDetailsStep />
              </Onboarding.Step>
              <Onboarding.Step step={2}>
                <CategoryStep />
              </Onboarding.Step>
              <Onboarding.Step step={3}>
                <BrandStep />
              </Onboarding.Step>
              <Onboarding.Step step={4}>
                <VehicleInfoStep />
              </Onboarding.Step>
              <Onboarding.Step step={5}>
                <PhotosStep />
              </Onboarding.Step>
              <Onboarding.Step step={6}>
                <ReviewStep onEditStep={(i) => setCurrentStep(i + 1)} />
              </Onboarding.Step>
            </AnimatePresence>
          </div>

          {/* Enhanced Navigation */}
          <div className="shrink-0 pt-3 border-t border-border/30">
            <Onboarding.Navigation
              completeLabel={
                isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-4" />
                    <span>{t('wizard.publishing')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    <span>{t('wizard.publish_btn')}</span>
                  </div>
                )
              }
            />
          </div>
        </div>

      </Onboarding>
    </FormProvider>
  )
}

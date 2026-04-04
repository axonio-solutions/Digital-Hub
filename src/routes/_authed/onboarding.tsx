import { createFileRoute, useRouter, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  MapPin,
  Phone,
  Store,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { WILAYAS } from '@/lib/constants/wilayas'
import { getTaxonomyServerFn } from '@/fn/admin'
import { useQuery } from '@tanstack/react-query'
import { completeOnboardingFn } from '@/fn/onboarding'
import { authQueries } from '@/features/auth/queries/auth-queries'
import { AvatarUpload } from '@/features/upload/components/avatar-upload'

export const Route = createFileRoute('/_authed/onboarding')({
  beforeLoad: async ({ context }) => {
    const { user } = context
    const isPending = user?.account_status !== 'active'
    
    // If user is already fully onboarded, do not let them access the onboarding page again.
    if (!isPending) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: OnboardingFlow,
})


function OnboardingFlow() {
  const { t } = useTranslation('dashboard/onboarding')
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = Route.useRouteContext()

  const steps = [
    { id: 1, title: t('steps.role.title'), description: t('steps.role.description') },
    { id: 2, title: t('steps.profile.title'), description: t('steps.profile.description') },
    { id: 3, title: t('steps.contact.title'), description: t('steps.contact.description') },
    { id: 4, title: t('steps.location.title'), description: t('steps.location.description') },
    { id: 5, title: t('steps.specialties.title'), description: t('steps.specialties.description') },
  ]

  const [formData, setFormData] = useState({
    role: (user?.role as 'buyer' | 'seller' | '') || '',
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    whatsappNumber: user?.whatsappNumber || '',
    storeName: user?.storeName || '',
    wilaya: user?.wilaya || '',
    city: user?.city || '',
    address: user?.address || '',
    companyAddress: user?.companyAddress || '',
    commercialRegister: user?.commercialRegister || '',
    image: user?.image || '',
    brandIds: [] as string[],
    categoryIds: [] as string[],
  })

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      return await completeOnboardingFn({
        data: {
          ...formData,
          role: formData.role,
        },
      })
    },
    onSuccess: async () => {
      toast.success(t('toast.success'))
      await queryClient.refetchQueries({
        queryKey: authQueries.user().queryKey,
      })
      await router.invalidate()
      
      if (formData.role === 'buyer') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/waitlist'
      }
    },
    onError: (err: any) => {
      toast.error(t('toast.error'), { description: err.message })
    },
  })

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.role === 'buyer' || formData.role === 'seller'
      case 2:
        return true // Profile pic is optional
      case 3:
        return (
          formData.name.length >= 2 &&
          formData.email.includes('@') &&
          formData.phoneNumber.length >= 8 &&
          formData.whatsappNumber.length >= 8
        )
      case 4:
        const baseValid =
          formData.wilaya.length > 0 &&
          formData.city.length > 0 &&
          formData.address.length > 0
        if (formData.role === 'seller') {
          return baseValid && formData.storeName.length >= 2
        }
        return baseValid
      default:
        return true
    }
  }

  const handleNext = () => {
    const valid = isStepValid()
    if (!valid) {
      toast.error(t('toast.fill_fields'))
      return
    }

    if (currentStep === 4) {
      if (formData.role === 'buyer') {
        completeOnboarding()
      } else {
        setCurrentStep(5)
      }
    } else if (currentStep === 5) {
      completeOnboarding()
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const stepValid = isStepValid()

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold">{t('role_step.title')}</CardTitle>
              <CardDescription className="text-sm">
                {t('role_step.desc')}
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AccountTypeCard
                selected={formData.role === 'buyer'}
                onClick={() => updateFormData('role', 'buyer')}
                icon={<User className="h-6 w-6 text-primary" />}
                title={t('role_step.buyer_title')}
                description={t('role_step.buyer_desc')}
              />
              <AccountTypeCard
                selected={formData.role === 'seller'}
                onClick={() => updateFormData('role', 'seller')}
                icon={<Briefcase className="h-6 w-6 text-primary" />}
                title={t('role_step.seller_title')}
                description={t('role_step.seller_desc')}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold">{t('profile_step.title')}</CardTitle>
              <CardDescription className="text-sm">
                {t('profile_step.desc')}
              </CardDescription>
            </CardHeader>
            <div className="flex items-center gap-6 pb-2 invisible h-0 overflow-hidden">
              {/* Avatar upload removed to avoid duplication with parent section */}
            </div>
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <AvatarUpload
                userId={user?.id || ''}
                currentImage={formData.image}
                name={formData.name}
                onUploadComplete={(url) => updateFormData('image', url)}
              />
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {t('profile_step.hint')}
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold">{t('contact_step.title')}</CardTitle>
              <CardDescription className="text-sm">
                {t('contact_step.desc')}
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('contact_step.full_name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 rtl:right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="ps-9 rtl:pe-9"
                    placeholder="Ahmed Kerroum"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('contact_step.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@mlila.dz"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('contact_step.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 rtl:right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    className="ps-9 rtl:pe-9"
                    placeholder="05xx xx xx xx"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">{t('contact_step.whatsapp')}</Label>
                <Input
                  id="whatsappNumber"
                  placeholder="05xx xx xx xx"
                  value={formData.whatsappNumber}
                  onChange={(e) => updateFormData('whatsappNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold">
                {formData.role === 'buyer' ? t('location_step.buyer_title') : t('location_step.seller_title')}
              </CardTitle>
              <CardDescription className="text-sm">
                {formData.role === 'buyer'
                  ? t('location_step.buyer_desc')
                  : t('location_step.seller_desc')}
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.role === 'seller' && (
                <div className="space-y-2">
                  <Label htmlFor="storeName">{t('location_step.store_name')}</Label>
                  <div className="relative">
                    <Store className="absolute left-3 rtl:right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeName"
                      className="ps-9"
                      placeholder="Grand Auto Parts"
                      value={formData.storeName}
                      onChange={(e) => updateFormData('storeName', e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="wilaya">{t('location_step.wilaya')}</Label>
                <Select
                  value={formData.wilaya}
                  onValueChange={(v) => updateFormData('wilaya', v)}
                >
                  <SelectTrigger id="wilaya">
                    <SelectValue placeholder={t('location_step.wilaya_placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {WILAYAS.map((w) => (
                      <SelectItem key={w.id} value={w.name}>
                        {w.id} - {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('location_step.city')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 rtl:right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    className="ps-9 rtl:pe-9"
                    placeholder="El Harrach"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('location_step.address')}</Label>
                <Input
                  id="address"
                  placeholder="08 Rue des Martyrs..."
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">{t('location_step.company_address')}</Label>
                <Input
                  id="companyAddress"
                  placeholder={t('location_step.company_placeholder')}
                  value={formData.companyAddress}
                  onChange={(e) => updateFormData('companyAddress', e.target.value)}
                />
              </div>
              {formData.role === 'seller' && (
                <div className="space-y-2">
                  <Label htmlFor="rcNumber">{t('location_step.rc')}</Label>
                  <Input
                    id="rcNumber"
                    placeholder="00B1234567"
                    value={formData.commercialRegister}
                    onChange={(e) => updateFormData('commercialRegister', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return <SpecialtiesStep formData={formData} setFormData={setFormData} />

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4 bg-muted/20 relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-5xl shadow-2xl border-none max-h-[min(90vh,700px)] flex flex-col overflow-hidden bg-card">
        <CardHeader className="pb-4 border-b bg-card rounded-t-xl shrink-0">
          <div className="flex items-center justify-between px-4">
            {steps
              .filter(s => s.id !== 5 || formData.role === 'seller')
              .map((step, idx, arr) => (
              <div key={step.id} className="relative flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 z-10',
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : currentStep === step.id
                        ? 'bg-primary text-primary-foreground shadow-lg ring-8 ring-primary/20'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {currentStep > step.id ? <Check className="h-6 w-6" /> : step.id}
                </div>
                <div className={cn(
                  'mt-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest',
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {step.id === 4 && formData.role === 'buyer' ? 'Personal' : step.title}
                </div>
                {idx < arr.length - 1 && (
                  <div className={cn(
                    'absolute top-6 left-[calc(50%+24px)] h-1 w-[calc(100%-48px)] -translate-y-1/2 bg-muted transition-colors duration-500',
                    currentStep > step.id && 'bg-primary/50'
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 bg-card flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto ps-2 custom-scrollbar">
            {renderStepContent()}
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border shrink-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isPending}
                className="h-11 px-6 border-2 hover:bg-accent font-semibold"
              >
                <ChevronLeft className="h-4 w-4 me-2 rtl:hidden" />
                <ChevronRight className="h-4 w-4 ms-2 hidden rtl:block" />
                {t('nav.back')}
              </Button>

              <Button
                onClick={handleNext}
                disabled={isPending || !stepValid}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-40 h-11 text-base shadow-lg shadow-primary/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === 1 && !formData.role 
                      ? t('nav.select_role') 
                      : currentStep === 4 && formData.role === 'buyer'
                        ? t('nav.complete')
                        : currentStep === 5
                          ? t('nav.complete')
                          : t('nav.continue')}
                    <ChevronRight className="h-5 w-5 ms-2 rtl:hidden" />
                    <ChevronLeft className="h-5 w-5 me-2 hidden rtl:block" />
                  </>
                )}
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SpecialtiesStep({ formData, setFormData }: any) {
  const { t } = useTranslation('dashboard/onboarding')
  const { data: taxonomy, isLoading } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: () => getTaxonomyServerFn(),
  })

  const toggleBrand = (id: string) => {
    const current = formData.brandIds || []
    if (current.includes(id)) {
      setFormData((prev: any) => ({
        ...prev,
        brandIds: current.filter((i: string) => i !== id),
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        brandIds: [...current, id],
      }))
    }
  }

  const toggleCategory = (id: string) => {
    const current = formData.categoryIds || []
    if (current.includes(id)) {
      setFormData((prev: any) => ({
        ...prev,
        categoryIds: current.filter((i: string) => i !== id),
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        categoryIds: [...current, id],
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground italic">{t('specialties_step.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-bold font-heading uppercase tracking-tight">{t('specialties_step.title')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('specialties_step.desc')}
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('specialties_step.brands')}</Label>
          <div className="flex flex-wrap gap-2">
            {taxonomy?.data?.brands?.map((brand: any) => {
              const active = formData.brandIds?.includes(brand.id)
              return (
                <Badge
                  key={brand.id}
                  variant={active ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer h-8 px-4 border-2 transition-all',
                    active
                      ? 'bg-primary border-primary text-primary-foreground shadow-md'
                      : 'hover:border-primary/20 hover:bg-primary/5 text-muted-foreground',
                  )}
                  onClick={() => toggleBrand(brand.id)}
                >
                  {brand.brand}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('specialties_step.categories')}</Label>
          <div className="flex flex-wrap gap-2">
            {taxonomy?.data?.categories?.map((cat: any) => {
              const active = formData.categoryIds?.includes(cat.id)
              return (
                <Badge
                  key={cat.id}
                  variant={active ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer h-8 px-4 border-2 transition-all',
                    active
                      ? 'bg-primary border-primary text-primary-foreground shadow-md'
                      : 'hover:border-primary/20 hover:bg-primary/5 text-muted-foreground',
                  )}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountTypeCard({ selected, onClick, icon, title, description }: any) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 transform',
        selected
          ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-lg -translate-y-1'
          : 'border-border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5',
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center text-center space-y-3 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-1">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground text-[13px] leading-relaxed px-2">
            {description}
          </p>
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "border-primary bg-primary" : "border-border"
        )}>
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </CardContent>
    </Card>
  )
}

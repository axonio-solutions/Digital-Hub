'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import {
  useCreateCreditPackage,
  useUpdateCreditPackage,
} from '../hooks/use-credits'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface PackageDialogProps {
  pkg: {
    id?: string
    name: string
    credits: number
    price: number
    description?: string
    isActive?: boolean
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PackageDialog({ pkg, open, onOpenChange }: PackageDialogProps) {
  const { t } = useTranslation('dashboard/credits')
  const { toast } = useToast('dashboard/credits')
  const isEditing = !!pkg?.id
  const [name, setName] = useState('')
  const [credits, setCredits] = useState(0)
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  const { mutate: create, isPending: isCreating } = useCreateCreditPackage()
  const { mutate: update, isPending: isUpdating } = useUpdateCreditPackage()

  useEffect(() => {
    if (pkg) {
      setName(pkg.name)
      setCredits(pkg.credits)
      setPrice(pkg.price)
      setDescription(pkg.description || '')
      setIsActive(pkg.isActive ?? true)
    } else {
      setName('')
      setCredits(0)
      setPrice(0)
      setDescription('')
      setIsActive(true)
    }
  }, [pkg, open])

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('packages.form.error_name_required')
      return
    }
    if (credits <= 0 || price <= 0) {
      toast.error('packages.form.error_credits_price')
      return
    }

    const data = {
      name: name.trim(),
      credits,
      price,
      description: description.trim() || undefined,
    }

    if (isEditing) {
      update(
        { id: pkg.id!, ...data, isActive },
        {
          onSuccess: () => {
            toast.success('packages.updated')
            onOpenChange(false)
          },
          onError: (err: any) =>
            toast.error('packages.error', { error: err.message }),
        },
      )
    } else {
      create(data, {
        onSuccess: () => {
          toast.success('packages.created')
          onOpenChange(false)
        },
        onError: (err: any) =>
          toast.error('packages.error', { error: err.message }),
      })
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            {isEditing ? t('packages.edit') : t('packages.add')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('packages.form.id_prefix', { id: pkg?.id?.slice(0, 8) })
              : t('packages.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">{t('packages.form.name')}</Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.form.name_placeholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pkg-credits">{t('packages.form.credits')}</Label>
              <Input
                id="pkg-credits"
                type="number"
                min={1}
                value={credits || ''}
                onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-price">{t('packages.form.price')}</Label>
              <Input
                id="pkg-price"
                type="number"
                min={1}
                value={price || ''}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-desc">{t('packages.form.description')}</Label>
            <Textarea
              id="pkg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('packages.form.description_placeholder')}
              className="resize-none h-20"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Switch
                id="pkg-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="pkg-active">{t('packages.form.is_active')}</Label>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('packages.form.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending
                ? t('packages.form.saving')
                : isEditing
                  ? t('packages.form.update')
                  : t('packages.form.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

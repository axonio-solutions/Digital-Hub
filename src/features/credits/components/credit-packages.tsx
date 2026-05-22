'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import {
  useCreditPackages,
  useToggleCreditPackageStatus,
} from '../hooks/use-credits'
import { PackageDialog } from './package-dialog'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { GlowingBadge } from '@/components/unlumen-ui/glowing-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function CreditPackages() {
  const { t } = useTranslation('dashboard/credits')
  const { toast } = useToast('dashboard/credits')
  const { data: packages = [], isLoading } = useCreditPackages()
  const { mutate: toggleStatus } = useToggleCreditPackageStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<any | null>(null)

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleStatus(
      { id, isActive: !currentActive },
      {
        onSuccess: () => toast.success('packages.toggled'),
        onError: (err: any) =>
          toast.error('packages.error', { error: err.message }),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <Skeleton className="h-10 w-32 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          {packages.length} {t('packages.title')}
        </p>
        <Button
          onClick={() => {
            setEditingPkg(null)
            setDialogOpen(true)
          }}
          className="h-9 px-4 rounded-xl gap-2 text-xs font-bold"
        >
          <Plus className="size-4" />
          {t('packages.add')}
        </Button>
      </div>

      {/* Package cards */}
      <div className="space-y-2">
        {packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm font-medium">
            {t('packages.add')}
          </div>
        ) : (
          packages.map((pkg: any) => (
            <div
              key={pkg.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border bg-card transition-all',
                !pkg.isActive && 'opacity-50',
              )}
            >
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <Package className="size-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">{pkg.name}</span>
                  <GlowingBadge
                    variant={pkg.isActive ? 'success' : 'neutral'}
                    className="text-[9px] uppercase"
                  >
                    {pkg.isActive
                      ? t('packages.active')
                      : t('packages.inactive')}
                  </GlowingBadge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="font-bold tabular-nums">
                    {pkg.credits} {t('packages.credits_unit')}
                  </span>
                  <span className="font-bold tabular-nums">
                    {pkg.price.toLocaleString()} {t('currency_dzd')}
                  </span>
                  {pkg.description && (
                    <>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="truncate">{pkg.description}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingPkg(pkg)
                    setDialogOpen(true)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(pkg.id, pkg.isActive)}
                  className="h-8 w-8 p-0"
                >
                  {pkg.isActive ? (
                    <PowerOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Power className="size-4 text-emerald-500" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <PackageDialog
        pkg={editingPkg}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

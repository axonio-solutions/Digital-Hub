import { useState, useMemo } from 'react'
import {
  Plus,
  FolderTree,
  Car,
  Edit,
  Trash2,
  Download,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ColumnDef,
} from '@tanstack/react-table'
import {
  useTaxonomy,
  useDeleteCategory,
  useDeleteBrand
} from '../hooks/use-taxonomy'

// Feature Components
import { StatusBadge } from '@/components/ui/status-badge'
import { CategoryDialog } from './category-dialog'
import { BrandDialog } from './brand-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'

// --- Data Types ---
type Category = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'draft' | 'archived'
  requestsCount?: number
}

type Brand = {
  id: string
  brand: string
  clusterOrigin: string
  clusterRegion: string
  status: 'active' | 'draft' | 'archived'
  requestsCount?: number
}

import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'

export function TaxonomyHub() {
  const { t } = useTranslation('dashboard/taxonomy')
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories')

  const CATEGORY_STATUSES = useMemo(() => [
    { label: t('table.columns.status_types.active', { defaultValue: 'Active' }), value: 'active', icon: () => <span className="size-2 rounded-full bg-emerald-500 me-2" /> },
    { label: t('table.columns.status_types.draft', { defaultValue: 'Draft' }), value: 'draft', icon: () => <span className="size-2 rounded-full bg-slate-400 me-2" /> },
    { label: t('table.columns.status_types.archived', { defaultValue: 'Archived' }), value: 'archived', icon: () => <span className="size-2 rounded-full bg-amber-500 me-2" /> },
  ], [t])

  // Dialog States
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // --- Backend Integration ---
  const { data, isLoading } = useTaxonomy()

  // Mutations
  const deleteCategoryMutation = useDeleteCategory()
  const deleteBrandMutation = useDeleteBrand()

  // --- Category Columns ---
  const categoryColumns = useMemo<ColumnDef<Category>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'info',
      header: t('table.columns.category_label'),
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0 py-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] leading-tight group-hover:text-blue-600 transition-colors">
                {tCategory(row.original.name, t)}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 opacity-60">#{String(row.original.id ?? '').substring(0, 8)}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
            {row.original.description || t('table.columns.no_description')}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'requestsCount',
      header: () => <div className="text-center">{t('table.columns.demand_logic')}</div>,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-900 dark:text-slate-300 tracking-tight">
          {(row.original.requestsCount || 0).toLocaleString()} {t('table.columns.units', { defaultValue: 'Units' })}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: t('table.columns.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: 'actions',
      header: () => <div className="text-end pe-4">{t('table.columns.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex justify-end pe-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t('table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-1.5">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">{t('table.actions.category_label')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => {
                  setEditingItem(row.original)
                  setIsCategoryDialogOpen(true)
                }}
                className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white transition-colors"
              >
                <Edit className="size-3.5" />
                {t('table.actions.update_label')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => {
                  deleteCategoryMutation.mutate(row.original.id)

                }}
                className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer text-rose-600 focus:bg-rose-600 focus:text-white transition-colors"
              >
                <Trash2 className="size-3.5" />
                {t('table.actions.delete_entry')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [deleteCategoryMutation, t])

  // --- Brand Columns ---
  const brandColumns = useMemo<ColumnDef<Brand>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'info',
      header: t('table.columns.manufacturer_spec'),
      accessorKey: 'brand',
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0 py-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] leading-tight group-hover:text-blue-600 transition-colors">
                {String(row.original.brand ?? 'Unknown Brand')}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 opacity-60">#{String(row.original.id ?? '').substring(0, 8)}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 text-[9px]">
            {t('table.columns.manufacturer_cluster')}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'clusterOrigin',
      header: () => <div className="text-center">{t('table.columns.cluster_origin')}</div>,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-700 dark:text-slate-300">
          {String(row.original.clusterOrigin ?? '-')}
        </div>
      )
    },
    {
      accessorKey: 'clusterRegion',
      header: () => <div className="text-center">{t('table.columns.cluster_region')}</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-slate-50/50 dark:bg-slate-900/50 px-3 py-0.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
            {String(row.original.clusterRegion ?? '-')}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'requestsCount',
      header: () => <div className="text-center">{t('table.columns.active_demand')}</div>,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-900 dark:text-slate-300 tracking-tight">
          {(row.original.requestsCount || 0).toLocaleString()} {t('table.columns.requests', { defaultValue: 'Requests' })}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: t('table.columns.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      id: 'actions',
      header: () => <div className="text-end pe-4">{t('table.columns.actions')}</div>,
      cell: ({ row }) => (
        <div className="flex justify-end pe-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t('table.actions.open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-1.5">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">{t('table.actions.brand_label')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => {
                  setEditingItem(row.original)
                  setIsBrandDialogOpen(true)
                }}
                className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer focus:bg-primary focus:text-white transition-colors"
              >
                <Edit className="size-3.5" />
                {t('table.actions.update_cluster')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => {
                  deleteBrandMutation.mutate(row.original.id)

                }}
                className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer text-rose-600 focus:bg-rose-600 focus:text-white transition-colors"
              >
                <Trash2 className="size-3.5" />
                {t('table.actions.delete_cluster')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [deleteBrandMutation, t])

  const tableData = useMemo(() => {
    if (isLoading || !data) {
      return []
    }
    return activeTab === 'categories' ? data.categories : (data as any).brands
  }, [data, isLoading, activeTab])

  const columns = useMemo(() => activeTab === 'categories' ? categoryColumns : brandColumns, [activeTab, categoryColumns, brandColumns])

  if (isLoading) {
    return <TaxonomySkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1400px] mx-auto w-full pt-4 px-6 md:px-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('title')}
          </h2>
          <p className="text-slate-500 max-w-2xl text-sm font-medium leading-relaxed">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-5 border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all rounded-xl">
            <Download size={16} /> {t('buttons.export')}
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null)
              if (activeTab === 'categories') setIsCategoryDialogOpen(true)
              else setIsBrandDialogOpen(true)
            }}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 gap-2 transition-all hover:scale-105 active:scale-95 rounded-xl border-none shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)]"
          >
            <Plus size={16} /> {t('buttons.add_new')}
          </Button>
        </div>
      </div>

      <DataTable
        data={tableData}
        columns={columns as any}
        toolbar={(table) => (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full md:w-auto">
                <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 border border-slate-200 dark:border-slate-700 h-10 rounded-xl">
                  <TabsTrigger value="categories" className="px-6 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none transition-all">
                    <FolderTree size={14} className="me-2" /> {t('tabs.categories')}
                  </TabsTrigger>
                  <TabsTrigger value="models" className="px-6 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none transition-all">
                    <Car size={14} className="me-2" /> {t('tabs.brands')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

              <DataTableToolbar
                table={table}
                searchColumn={activeTab === 'categories' ? 'name' : 'brand'}
                searchPlaceholder={t('table.search_placeholder', { tab: t(`tabs.${activeTab}`) })}
                facetedFilters={[
                  {
                    column: 'status',
                    title: t('table.columns.status'),
                    options: CATEGORY_STATUSES,
                  },
                ]}
              />
            </div>
          </div>
        )}
      />

      {/* Dialogs */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        editingItem={editingItem}
      />
      <BrandDialog
        open={isBrandDialogOpen}
        onOpenChange={setIsBrandDialogOpen}
        editingItem={editingItem}
      />
    </div>
  )
}

function TaxonomySkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1400px] mx-auto w-full pt-4 px-6 md:px-10 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[700px]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="p-0 flex-1">
          <div className="h-12 border-b border-slate-50 flex items-center px-6 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 border-b border-slate-50/50 flex items-center px-6 gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-4 flex-1 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


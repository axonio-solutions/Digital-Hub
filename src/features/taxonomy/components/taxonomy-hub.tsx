'use client'

import { useMemo, useState } from 'react'
import { Plus, FolderTree, Car, Edit, Trash2, MoreHorizontal, Download } from 'lucide-react'
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues, ColumnFiltersState, SortingState, flexRender } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import { CategoryDialog } from './category-dialog'
import { BrandDialog } from './brand-dialog'
import { useTaxonomy, useDeleteCategory, useDeleteBrand } from '../hooks/use-taxonomy'
import { useTranslation } from 'react-i18next'
import { tCategory } from '@/utils/category-utils'

type TabId = 'categories' | 'brands'

export function TaxonomyHub() {
  const { t } = useTranslation('dashboard/taxonomy')
  const [activeTab, setActiveTab] = useState<TabId>('categories')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isBrandOpen, setIsBrandOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading } = useTaxonomy()
  const deleteCategory = useDeleteCategory()
  const deleteBrand = useDeleteBrand()

  const categoryStatuses = useMemo(() => [
    { label: t('table.columns.status_types.active', 'Active'), value: 'active', icon: () => <span className="size-2 rounded-full bg-emerald-500 me-2" /> },
    { label: t('table.columns.status_types.draft', 'Draft'), value: 'draft', icon: () => <span className="size-2 rounded-full bg-slate-400 me-2" /> },
    { label: t('table.columns.status_types.archived', 'Archived'), value: 'archived', icon: () => <span className="size-2 rounded-full bg-amber-500 me-2" /> },
  ], [t])

  const categories = (data as any)?.categories || []
  const brands = (data as any)?.brands || []
  const tableData = activeTab === 'categories' ? categories : brands

  const categoryCols: Array<ColumnDef<any>> = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />,
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: 'name', header: t('table.columns.category_label'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 rounded-lg shrink-0 border border-slate-200 dark:border-slate-800">
            <AvatarImage src={row.original.imageUrl} className="object-cover" />
            <AvatarFallback className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">
              {row.original.name?.substring(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[200px]">{tCategory(row.original.name, t)}</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{row.original.description || t('table.columns.no_description')}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'requestsCount', header: t('table.columns.demand_logic'),
      cell: ({ row }) => <span className="font-bold text-sm tabular-nums">{(row.original.requestsCount || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status', header: t('table.columns.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 rounded-full"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">{t('table.actions.category_label')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setEditing(row.original); setIsCategoryOpen(true) }} className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer">
                <Edit className="size-3.5" /> {t('table.actions.update_label')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteCategory.mutate(row.original.id)} className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer text-rose-600 focus:bg-rose-600 focus:text-white">
                <Trash2 className="size-3.5" /> {t('table.actions.delete_entry')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [t, deleteCategory])

  const brandCols: Array<ColumnDef<any>> = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />,
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: 'brand', header: t('table.columns.manufacturer_spec'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 rounded-lg shrink-0 border border-slate-200 dark:border-slate-800">
            <AvatarImage src={row.original.imageUrl} className="object-cover" />
            <AvatarFallback className="text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg">
              {row.original.brand?.substring(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[200px]">{row.original.brand || 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">#{row.original.id?.substring(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'clusterOrigin', header: t('table.columns.cluster_origin'),
      cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.original.clusterOrigin || '-'}</span>,
    },
    {
      accessorKey: 'clusterRegion', header: t('table.columns.cluster_region'),
      cell: ({ row }) => <Badge variant="outline" className="text-[10px] rounded-full">{row.original.clusterRegion || '-'}</Badge>,
    },
    {
      accessorKey: 'requestsCount', header: t('table.columns.active_demand'),
      cell: ({ row }) => <span className="font-bold text-sm tabular-nums">{(row.original.requestsCount || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status', header: t('table.columns.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 rounded-full"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">{t('table.actions.brand_label')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setEditing(row.original); setIsBrandOpen(true) }} className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer">
                <Edit className="size-3.5" /> {t('table.actions.update_cluster')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteBrand.mutate(row.original.id)} className="rounded-lg font-bold text-xs gap-2 py-2 cursor-pointer text-rose-600 focus:bg-rose-600 focus:text-white">
                <Trash2 className="size-3.5" /> {t('table.actions.delete_cluster')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [t, deleteBrand])

  const columns = activeTab === 'categories' ? categoryCols : brandCols
  const searchCol = activeTab === 'categories' ? 'name' : 'brand'

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 20 } },
  })

  const handleAdd = () => { setEditing(null); activeTab === 'categories' ? setIsCategoryOpen(true) : setIsBrandOpen(true) }

  if (isLoading && !data) {
    return <TaxonomySkeleton />
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-sky-500/20 shrink-0">
            <FolderTree className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{t('title')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t('description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 gap-2 font-bold text-xs uppercase tracking-wider shadow-sm">
            <Download size={14} /> {t('buttons.export')}
          </Button>
          <Button onClick={handleAdd} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">
            <Plus size={14} /> {t('buttons.add_new')}
          </Button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-2xl text-blue-500 bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-center gap-1.5"><FolderTree className="size-4" /><span className="text-xl font-black tabular-nums leading-none">{categories.length}</span></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{t('tabs.categories')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-2xl text-amber-500 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-center gap-1.5"><Car className="size-4" /><span className="text-xl font-black tabular-nums leading-none">{brands.length}</span></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight">{t('tabs.brands')}</span>
        </div>
      </div>

      {/* Tabs + Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TabId)}>
          <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 border border-slate-200 dark:border-slate-700 h-10 rounded-xl">
            <TabsTrigger value="categories" className="px-4 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 rounded-lg">
              <FolderTree size={14} className="me-1.5" /> {t('tabs.categories')}
            </TabsTrigger>
            <TabsTrigger value="brands" className="px-4 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 rounded-lg">
              <Car size={14} className="me-1.5" /> {t('tabs.brands')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <DataTableToolbar table={table} searchColumn={searchCol}
            searchPlaceholder={t('table.search_placeholder', { tab: t(`tabs.${activeTab}`) })}
            hideViewOptions
            facetedFilters={[{ column: 'status', title: t('table.columns.status'), options: categoryStatuses }]} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">No results</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      <CategoryDialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen} editingItem={editing} />
      <BrandDialog open={isBrandOpen} onOpenChange={setIsBrandOpen} editingItem={editing} />
    </div>
  )
}

function TaxonomySkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full pb-8 pt-2 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-3.5 w-64 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-[500px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  )
}

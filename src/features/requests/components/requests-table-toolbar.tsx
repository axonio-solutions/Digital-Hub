"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options"

import { requestStatuses } from "../data/request-filters"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import { useMemo } from "react"

interface RequestsTableToolbarProps<TData> {
    table: Table<TData>
}

export function RequestsTableToolbar<TData>({
    table,
}: RequestsTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    // Extract unique brands from the table data for faceted filtering
    const brandOptions = useMemo(() => {
        const brands = new Set<string>()
        table.getCoreRowModel().rows.forEach((row) => {
            const brand = (row.original as any).vehicleBrand
            if (brand) brands.add(brand)
        })
        return Array.from(brands).sort().map(brand => ({
            label: brand,
            value: brand,
        }))
    }, [table.getCoreRowModel().rows])

    return (
        <div className="flex items-center justify-between gap-4 bg-white/30 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input
                    placeholder="Filter by part or OEM..."
                    value={(table.getColumn("partName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("partName")?.setFilterValue(event.target.value)
                    }
                    className="h-10 w-[150px] lg:w-[250px] rounded-xl border-white/20 bg-white/50"
                />

                {table.getColumn("vehicleBrand") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("vehicleBrand")}
                        title="Brands"
                        options={brandOptions}
                    />
                )}

                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("status")}
                        title="Status"
                        options={requestStatuses}
                    />
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-10 px-2 lg:px-3 text-slate-500 hover:text-slate-900"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}

"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options"

import { roles, integrityStatuses } from "../data/user-filters"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"

interface AdminUsersTableToolbarProps<TData> {
    table: Table<TData>
}

export function AdminUsersTableToolbar<TData>({
    table,
}: AdminUsersTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input
                    placeholder="Search nodes by identity..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-10 w-[150px] lg:w-[250px] rounded-xl border-slate-200/50 bg-white"
                />

                {table.getColumn("role") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("role")}
                        title="Role Matrix"
                        options={roles}
                    />
                )}

                {table.getColumn("banned") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("banned")}
                        title="Integrity"
                        options={integrityStatuses}
                    />
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-10 px-2 lg:px-3 text-slate-500 hover:text-slate-900"
                    >
                        Reset Filters
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

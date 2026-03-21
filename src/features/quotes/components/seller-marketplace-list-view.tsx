import { useMemo } from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    ArrowUpDown,
    CarFront,
    Clock,
    Send,
    Eye,
    Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SellerMarketplaceListViewProps {
    data: any[]
    onAction: (item: any) => void
    type: 'opportunity' | 'active'
}

export function SellerMarketplaceListView({ data, onAction, type }: SellerMarketplaceListViewProps) {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns: any[] = useMemo(
        () => [
            {
                accessorKey: "partName",
                header: ({ column }: { column: any }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="px-0 hover:bg-transparent"
                        >
                            Part Requested
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }: { row: any }) => {
                    const partName = row.original.partName
                    const oem = row.original.oemNumber
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{partName}</span>
                            {oem && <span className="text-[10px] font-mono text-muted-foreground">OEM: {oem}</span>}
                        </div>
                    )
                },
            },
            {
                accessorKey: "vehicleBrand",
                header: "Vehicle",
                cell: ({ row }: { row: any }) => {
                    const brand = row.original.vehicleBrand
                    const model = row.original.vehicleModel || ""
                    const year = row.original.modelYear
                    return (
                        <div className="flex items-center gap-2">
                            <CarFront className="size-3 text-muted-foreground" />
                            <span className="text-xs">{brand} {model} ({year})</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "createdAt",
                header: "Posted",
                cell: ({ row }: { row: any }) => {
                    return (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            {new Date(row.getValue("createdAt")).toLocaleDateString()}
                        </div>
                    )
                },
            },
            {
                id: "status",
                header: "Status",
                cell: () => type === 'active' ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 capitalize py-0.5">
                        <Clock className="size-3" />
                        Bidded
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 capitalize py-0.5">
                        Open
                    </Badge>
                )
            },
            {
                id: "actions",
                cell: ({ row }: { row: any }) => {
                    return (
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                variant={type === 'opportunity' ? "default" : "outline"}
                                className="h-8 gap-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAction(row.original)
                                }}
                            >
                                {type === 'opportunity' ? (
                                    <>
                                        <Send className="size-3" />
                                        Quote
                                    </>
                                ) : (
                                    <>
                                        <Eye className="size-3" />
                                        View
                                    </>
                                )}
                            </Button>
                        </div>
                    )
                },
            },
        ],
        [onAction, type]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="hover:bg-slate-50/50 transition-colors"
                                onClick={() => onAction(row.original)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                No items found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

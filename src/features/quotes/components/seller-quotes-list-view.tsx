import { useMemo } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
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
    MoreHorizontal,
    CarFront,
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SellerQuotesListViewProps {
    data: any[]
}

export function SellerQuotesListView({ data }: SellerQuotesListViewProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "request.partName",
                header: ({ column }) => {
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
                cell: ({ row }) => {
                    const partName = row.original.request?.partName || "Unknown Part"
                    const oem = row.original.request?.oemNumber
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{partName}</span>
                            {oem && <span className="text-[10px] font-mono text-muted-foreground mt-0.5">OEM: {oem}</span>}
                        </div>
                    )
                },
            },
            {
                accessorKey: "request.vehicleBrand",
                header: "Vehicle",
                cell: ({ row }) => {
                    const brand = row.original.request?.vehicleBrand
                    const model = row.original.request?.vehicleModel
                    const year = row.original.request?.modelYear
                    return (
                        <div className="flex items-center gap-2">
                            <CarFront className="size-3 text-muted-foreground" />
                            <span className="text-xs">{brand} {model} ({year})</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "price",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="px-0 hover:bg-transparent"
                        >
                            My Offer
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => {
                    const price = parseFloat(row.getValue("price"))
                    return <div className="font-bold text-primary">{price.toLocaleString()} DZD</div>
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status
                    const reqStatus = row.original.request?.status

                    if (status === 'accepted') {
                        return (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 capitalize py-0.5">
                                <CheckCircle2 className="size-3" />
                                Won
                            </Badge>
                        )
                    }

                    if (reqStatus === 'fulfilled' && status !== 'accepted') {
                        return (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1 capitalize py-0.5">
                                <XCircle className="size-3" />
                                Lost
                            </Badge>
                        )
                    }

                    return (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 capitalize py-0.5">
                            <Clock className="size-3" />
                            Pending
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "condition",
                header: "Parts Details",
                cell: ({ row }) => {
                    const condition = row.original.condition
                    const warranty = row.original.warranty
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <Badge variant="secondary" className="text-[10px] h-4 px-1">{condition}</Badge>
                                {warranty && <div className="text-[10px] text-emerald-600 flex items-center gap-0.5"><ShieldCheck className="size-2.5" /> Guar.</div>}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "createdAt",
                header: "Submitted",
                cell: ({ row }) => {
                    return <div className="text-xs text-muted-foreground">{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => window.open(`/dashboard/requests/${row.original.requestId}`, '_blank')}>
                                    View Original Request
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Add Note</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Withdraw Quote</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Filter parts..."
                    value={(table.getColumn("request_partName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("request_partName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>
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
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-50/50 transition-colors"
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No quotes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

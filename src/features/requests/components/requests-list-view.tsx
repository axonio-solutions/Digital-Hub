"use client";

import { useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Eye,
    MessageSquare,
    Calendar,
    Car,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface RequestsListViewProps {
    data: any[];
    onReview: (request: any) => void;
}

export function RequestsListView({ data, onReview }: RequestsListViewProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "image",
                header: "",
                cell: ({ row }) => {
                    const images = row.original.imageUrls || [];
                    return (
                        <div className="size-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center border border-muted-foreground/10">
                            {images.length > 0 ? (
                                <img src={images[0]} alt={row.original.partName} className="object-cover size-full" />
                            ) : (
                                <Car className="size-5 text-muted-foreground/40" />
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "partName",
                header: "Part Description",
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{row.original.partName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tight">ID: {row.original.id.substring(0, 8)}</span>
                    </div>
                ),
            },
            {
                accessorKey: "vehicleBrand",
                header: "Vehicle",
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.original.vehicleBrand}</span>
                        <span className="text-xs text-muted-foreground">{row.original.modelYear}</span>
                    </div>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3" />
                        <span className="text-xs">{new Date(row.original.createdAt).toLocaleDateString()}</span>
                    </div>
                ),
            },
            {
                accessorKey: "quotes",
                header: "Offers",
                cell: ({ row }) => {
                    const count = row.original.quotes?.length || 0;
                    return (
                        <div className="flex items-center gap-1.5">
                            <MessageSquare className={`size-3 ${count > 0 ? 'text-primary' : 'text-muted-foreground/30'}`} />
                            <span className={`text-sm font-bold ${count > 0 ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                                {count}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <Badge
                            variant={status === 'open' ? 'default' : status === 'fulfilled' ? 'secondary' : 'outline'}
                            className={`text-[10px] uppercase font-bold py-0 h-5 ${status === 'open' ? 'bg-blue-500 hover:bg-blue-600' :
                                    status === 'fulfilled' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200' :
                                        'text-muted-foreground'
                                }`}
                        >
                            {status}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const request = row.original;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group"
                                onClick={() => onReview(request)}
                            >
                                Review
                                <ChevronRight className="ml-1 size-3 group-hover:translate-x-0.5 transition-transform" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onReview(request)}>
                                        <Eye className="mr-2 h-3 w-3" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [onReview]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-muted-foreground/10 bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-muted-foreground/10">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-bold uppercase tracking-wider h-11 text-muted-foreground/70">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="group hover:bg-muted/20 border-muted-foreground/5 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                                    No requests found in this view.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} total requests
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 text-xs font-medium"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 text-xs font-medium"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

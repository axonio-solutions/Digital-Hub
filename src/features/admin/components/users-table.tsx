import { useState, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    getPaginationRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    ColumnFiltersState,
    VisibilityState,
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
    Shield,
    ShieldOff,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Store,
    Activity,
    CheckCircle2,
    XCircle,
    Info,
    ArrowUpDown,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdminUsersTableToolbar } from "./users-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";

interface AdminUsersTableProps {
    users: any[];
    onBan?: (userId: string) => void;
    onUnban?: (userId: string) => void;
}

export function AdminUsersTable({ users = [], onBan, onUnban }: AdminUsersTableProps) {
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Table States
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent font-black text-slate-400 uppercase tracking-widest text-[10px]"
                    >
                        Registry Node
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex items-center gap-4 py-1">
                            <Avatar className="size-10 shadow-sm border-2 border-white ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
                                <AvatarImage src={user.image} />
                                <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px]">
                                    {user.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 tracking-tight leading-none mb-1">{user.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                    <MapPin className="size-2.5" /> {user.wilaya || "Global"}
                                </span>
                            </div>
                        </div>
                    );
                },
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id))
                },
            },
            {
                accessorKey: "email",
                header: "Auth Index",
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <Mail className="size-3 text-slate-400" /> {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                <Phone className="size-2.5 text-slate-400" /> {user.phone || "No Auth"}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "role",
                header: "Role Matrix",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className={cn(
                            "font-black text-[9px] uppercase tracking-tighter px-2.5 py-0.5 rounded-full border-0 shadow-sm",
                            row.original.role === 'admin' ? "bg-slate-950 text-white" :
                                row.original.role === 'seller' ? "bg-emerald-100 text-emerald-700" :
                                    "bg-blue-100 text-blue-700"
                        )}
                    >
                        {row.original.role}
                    </Badge>
                ),
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id))
                },
            },
            {
                accessorKey: "banned",
                header: "Integrity",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.banned ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase tracking-tighter ring-1 ring-red-200">
                                <XCircle className="size-2.5" /> Compromised
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-tighter ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-2.5" /> Secure
                            </div>
                        )}
                    </div>
                ),
                filterFn: (row, id, value) => {
                    // value is an array of strings like ["true", "false"]
                    return value.includes(String(row.getValue(id)))
                },
            },
            {
                id: "actions",
                header: () => <div className="text-right">Control</div>,
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(row.original);
                            }}
                        >
                            <Info className="size-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getRowId: (row) => row.id || row.email,
    });

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Table Controls - V2 Tasks Style */}
            <AdminUsersTableToolbar table={table} />

            {/* Main Data Grid - Clean Style */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200/60">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
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
                                    className="group hover:bg-slate-50/30 transition-colors border-slate-100 cursor-pointer"
                                    onClick={() => handleViewDetails(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No matching nodes identified
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <DataTablePagination table={table} />
                </div>
            </div>

            {/* Profile Detail Dialog - High Fidelity Center-Aligned */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl w-full p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl">
                    {selectedUser && (
                        <div className="flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="relative p-8 space-y-8">
                                <DialogHeader className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="size-24 border-2 border-slate-100 shadow-sm">
                                            <AvatarImage src={selectedUser.image} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                                                {selectedUser.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2">
                                            <div className="space-y-0.5 text-left">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[10px]">Registry Profile</Badge>
                                                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedUser.name}</DialogTitle>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] tracking-widest">{selectedUser.role}</Badge>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] tracking-widest">{selectedUser.wilaya}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="bg-slate-100" />
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailCard icon={Mail} label="Auth Channel" value={selectedUser.email} />
                                    <DetailCard icon={Phone} label="Mobile Link" value={selectedUser.phone || "NO DATA"} />
                                    <DetailCard icon={Calendar} label="Nodes Synced" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
                                    <DetailCard icon={Activity} label="Nexus Status" value={selectedUser.banned ? "Compromised" : "Authorized"} status={!selectedUser.banned} />
                                </div>

                                {selectedUser.role === 'seller' && (
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Store className="size-5 text-emerald-600" />
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Merchant Dossier</h3>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade Identity</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Verified Supply Node</p>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 leading-tight">{selectedUser.storeName || "Anonymous Hub"}</p>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <MapPin className="size-4 text-primary/60" /> {selectedUser.storeAddress || "Regional Distribution Only"}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 flex flex-col gap-3">
                                    {selectedUser.banned ? (
                                        <Button
                                            onClick={() => onUnban?.(selectedUser.id)}
                                            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95"
                                        >
                                            <Shield className="mr-2 size-4" /> Restore Nexus Access
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => onBan?.(selectedUser.id)}
                                            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95"
                                        >
                                            <ShieldOff className="mr-2 size-4" /> Sever Node Access
                                        </Button>
                                    )}
                                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-50 pt-4">Nexus Control Protocol v2.5</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailCard({ icon: Icon, label, value, status }: any) {
    return (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100 transition-colors border-l-4 border-l-primary/30">
            <div className="flex items-center gap-2">
                <Icon className="size-3 text-slate-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className={cn(
                "font-black tracking-tight",
                status === true ? "text-emerald-600" : status === false ? "text-red-600" : "text-slate-900"
            )}>
                {value}
            </p>
        </div>
    )
}

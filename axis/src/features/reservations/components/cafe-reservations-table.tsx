import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconEdit,
	IconEyeCog,
	IconProgress,
	IconProgressCheck,
	IconProgressX,
	IconTrash,
} from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { z } from "zod";

import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DeleteReservationDialog } from "./modals/delete-reservation";
import { EditReservationSheet } from "./sheets/edit-reservation";
import { TableCellViewer } from "./table-cell-viewer";

// Reservations Schema
export const schema = z.object({
	id: z.number(),
	guestName: z.string(),
	phoneNumber: z.string(),
	area: z.string(),
	guestCount: z.number(),
	totalPrice: z.string(),
	status: z.string(),
	specialRequests: z.string().optional(),
});

export function CafeReservationsTable({
	data: initialData,
}: {
	data: z.infer<typeof schema>[];
}) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
	const [reservationToDelete, setReservationToDelete] = React.useState<z.infer<
		typeof schema
	> | null>(null);

	const handleDeleteReservation = (reservation: z.infer<typeof schema>) => {
		setReservationToDelete(reservation);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteSuccess = () => {
		// Remove the deleted reservation from the data
		if (reservationToDelete) {
			const newData = data.filter((item) => item.id !== reservationToDelete.id);
			setData(newData);
		}
	};

	const handleUpdateReservation = (updatedData: z.infer<typeof schema>) => {
		// Update the reservation in the data array
		const newData = data.map((item) =>
			item.id === updatedData.id ? updatedData : item,
		);
		setData(newData);
	};

	// Reservations Columns
	const columns: ColumnDef<z.infer<typeof schema>>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "guestName",
			header: "اسم الضيف",
			cell: ({ row }) => <TableCellViewer item={row.original} />,
			enableHiding: false,
		},
		{
			accessorKey: "phoneNumber",
			header: "رقم الهاتف",
			cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
		},
		{
			accessorKey: "area",
			header: "المنطقة",
			cell: ({ row }) => <div>{row.original.area}</div>,
		},
		{
			accessorKey: "guestCount",
			header: "عدد الضيوف",
			cell: ({ row }) => <div>{row.original.guestCount} شخص</div>,
		},
		{
			accessorKey: "totalPrice",
			header: "السعر الاجمالي",
			cell: ({ row }) => (
				<div className="flex gap-1 items-center">
					{row.original.totalPrice}
					<SaudiRiyalSymbol />
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "حالة الحجز",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={cn(
						"px-2.5 py-0.5",
						row.original.status === "confirmed"
							? "bg-green-50 text-green-700 border-green-200"
							: row.original.status === "pending"
								? "bg-yellow-50 text-yellow-700 border-yellow-200"
								: "text-muted-foreground",
					)}
				>
					{row.original.status === "confirmed" ? (
						<IconProgressCheck className="h-4 w-4" />
					) : row.original.status === "pending" ? (
						<IconProgress className="h-4 w-4" />
					) : (
						<IconProgressX className="h-4 w-4" />
					)}
					{row.original.status === "confirmed"
						? "مؤكد"
						: row.original.status === "pending"
							? "قيد الانتظار"
							: "ملغي"}
				</Badge>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<div className="flex gap-1">
					<EditReservationSheet
						reservation={row.original}
						onSuccess={() => handleUpdateReservation(row.original)}
					/>
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() => handleDeleteReservation(row.original)}
					>
						<IconTrash className="h-4 w-4 text-red-500" />
					</Button>
				</div>
			),
		},
	];

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="relative flex flex-col gap-4 overflow-auto">
			<div className="flex items-center justify-end">
				<DropdownMenu dir="rtl">
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<span className="hidden lg:inline">تخصيص أعمدة الجدول</span>
							<span className="lg:hidden">تخصيص الأعمدة</span>
							<IconEyeCog className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-fit">
						{table
							.getAllColumns()
							.filter(
								(column) =>
									typeof column.accessorFn !== "undefined" &&
									column.getCanHide(),
							)
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.columnDef.header}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader className="bg-muted sticky top-0">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="**:data-[slot=table-cell]:first:w-8">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									لا توجد نتائج.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between px-4">
				<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
					{table.getFilteredSelectedRowModel().rows.length} من{" "}
					{table.getFilteredRowModel().rows.length} صف محدد.
				</div>
				<div className="flex w-full items-center gap-8 lg:w-fit">
					<div className="hidden items-center gap-2 lg:flex">
						<Label htmlFor="rows-per-page" className="text-sm font-medium">
							صفوف لكل صفحة
						</Label>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger size="sm" className="w-20" id="rows-per-page">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-fit items-center justify-center text-sm font-medium">
						صفحة {table.getState().pagination.pageIndex + 1} من{" "}
						{table.getPageCount()}
					</div>
					<div className="ml-auto flex items-center gap-2 lg:ml-0">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">الصفحة الأولى</span>
							<IconChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">الصفحة السابقة</span>
							<IconChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">الصفحة التالية</span>
							<IconChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden size-8 lg:flex"
							size="icon"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">الصفحة الأخيرة</span>
							<IconChevronsRight />
						</Button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<DeleteReservationDialog
				reservation={reservationToDelete}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setReservationToDelete(null);
				}}
				onSuccess={handleDeleteSuccess}
			/>
		</div>
	);
}

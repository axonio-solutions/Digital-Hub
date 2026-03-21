import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
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
import { EventCellViewer } from "./event-cell-viewer";
import { DeleteEventDialog } from "./modals/delete-event";
import { EditEventSheet } from "./sheets/edit-event";

// Events Schema
export const eventsSchema = z.object({
	id: z.number(),
	eventName: z.string(),
	eventDate: z.string(),
	location: z.string(),
	capacity: z.number(),
	ticketPrice: z.string(),
	status: z.string(),
});

export function EventsTable({
	data: initialData,
}: {
	data: z.infer<typeof eventsSchema>[];
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
	const [eventToDelete, setEventToDelete] = React.useState<z.infer<
		typeof eventsSchema
	> | null>(null);

	const handleDeleteEvent = (event: z.infer<typeof eventsSchema>) => {
		setEventToDelete(event);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteSuccess = () => {
		// Remove the deleted event from the data
		if (eventToDelete) {
			const newData = data.filter((item) => item.id !== eventToDelete.id);
			setData(newData);
		}
	};

	const handleUpdateEvent = (updatedData: z.infer<typeof eventsSchema>) => {
		// Update the event in the data array
		const newData = data.map((item) =>
			item.id === updatedData.id ? updatedData : item,
		);
		setData(newData);
	};

	// Events Columns
	const eventsColumns: ColumnDef<z.infer<typeof eventsSchema>>[] = [
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
			accessorKey: "eventName",
			header: "اسم الفعالية",
			cell: ({ row }) => <EventCellViewer item={row.original} />,
			enableHiding: false,
		},
		{
			accessorKey: "eventDate",
			header: "تاريخ الفعالية",
			cell: ({ row }) => <div>{row.original.eventDate}</div>,
		},
		{
			accessorKey: "location",
			header: "المكان",
			cell: ({ row }) => <div>{row.original.location}</div>,
		},
		{
			accessorKey: "capacity",
			header: "السعة",
			cell: ({ row }) => <div>{row.original.capacity} شخص</div>,
		},
		{
			accessorKey: "ticketPrice",
			header: "سعر التذكرة",
			cell: ({ row }) => (
				<div className="flex gap-1 items-center">
					{row.original.ticketPrice}
					<SaudiRiyalSymbol />
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "الحالة",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={cn(
						"px-2.5 py-0.5",
						row.original.status === "active"
							? "bg-green-50 text-green-700 border-green-200"
							: row.original.status === "upcoming"
								? "bg-blue-50 text-blue-700 border-blue-200"
								: "text-muted-foreground",
					)}
				>
					{row.original.status === "active" ? (
						<IconProgressCheck className="h-4 w-4" />
					) : row.original.status === "upcoming" ? (
						<IconProgress className="h-4 w-4" />
					) : (
						<IconProgressX className="h-4 w-4" />
					)}
					{row.original.status === "active"
						? "جارية"
						: row.original.status === "upcoming"
							? "قادمة"
							: "منتهية"}
				</Badge>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<div className="flex gap-1">
					<EditEventSheet
						event={row.original}
						onSuccess={() => handleUpdateEvent(row.original)}
					/>
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() => handleDeleteEvent(row.original)}
					>
						<IconTrash className="h-4 w-4 text-red-500" />
					</Button>
				</div>
			),
		},
	];

	const table = useReactTable({
		data,
		columns: eventsColumns,
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
									colSpan={eventsColumns.length}
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
						<Label
							htmlFor="rows-per-page-events"
							className="text-sm font-medium"
						>
							صفوف لكل صفحة
						</Label>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger
								size="sm"
								className="w-20"
								id="rows-per-page-events"
							>
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
			<DeleteEventDialog
				event={eventToDelete}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setEventToDelete(null);
				}}
				onSuccess={handleDeleteSuccess}
			/>
		</div>
	);
}

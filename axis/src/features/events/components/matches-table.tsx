import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleDashed,
	IconCircleDashedCheck,
	IconEye,
	IconEyeCog,
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

import { Icons } from "@/components/icons";
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
import { Suspense, useCallback, useState } from "react";
import type { MatchEventTableRow } from "../schema";
import { MatchCellViewer } from "./match-cell-viewer";
import { MatchesTableContent } from "./matches-table-content";
import { DeleteMatchDialog } from "./modals/delete-match";
import { AddMatchSheet } from "./sheets/add-match-sheet";
import { EditMatchSheet } from "./sheets/edit-match-sheet";
import { MatchDetailsSheet } from "./sheets/match-details-sheet";

export function MatchesTable() {
	const [data, setData] = useState<MatchEventTableRow[]>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [matchToDelete, setMatchToDelete] = useState<MatchEventTableRow | null>(
		null,
	);

	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedMatch, setSelectedMatch] = useState<MatchEventTableRow | null>(
		null,
	);

	const handleAddMatch = (newMatch: MatchEventTableRow) => {
		setData((prevData) => [...prevData, newMatch]);
	};

	const handleUpdateMatch = (updatedMatch: MatchEventTableRow) => {
		setData((prevData) =>
			prevData.map((match) =>
				match.id === updatedMatch.id ? updatedMatch : match,
			),
		);
	};

	const handleDeleteMatch = (matchData: MatchEventTableRow) => {
		setMatchToDelete(matchData);
		setIsDeleteModalOpen(true);
	};

	const handleViewDetails = (match: MatchEventTableRow) => {
		setSelectedMatch(match);
		setIsDetailsModalOpen(true);
	};

	const handleCloseDetailsModal = () => {
		setIsDetailsModalOpen(false);
		setSelectedMatch(null);
	};

	const handleOnDataChange = useCallback((newData: MatchEventTableRow[]) => {
		setData((prev) => {
			if (JSON.stringify(prev) !== JSON.stringify(newData)) {
				return newData;
			}
			return prev;
		});
	}, []);

	const columns: ColumnDef<MatchEventTableRow>[] = [
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
			accessorKey: "match",
			header: "المباراة",
			cell: ({ row }) => <div>{row.original.match}</div>,
			enableHiding: false,
		},
		{
			accessorKey: "dateTime",
			header: "التاريخ والوقت",
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.date}</span>
					<span className="text-xs">{row.original.time}</span>
				</div>
			),
		},
		{
			accessorKey: "capacity",
			header: "السعة",
			cell: ({ row }) => {
				const { remaining, total } = row.original.capacity;
				const diff = total - remaining;
				return (
					<div className="flex flex-col">
						<span className="font-medium">
							{total}/{remaining}
						</span>
						<span className="text-xs">
							متبقي {total === remaining ? total : diff}{" "}
							{diff === 1 ? "مقعد" : "مقاعد"}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "الحالة",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={cn(
						"px-2.5 py-0.5",
						row.original.status === "ongoing"
							? "bg-green-50 text-green-700 border-green-200"
							: row.original.status === "upcoming"
								? "bg-blue-50 text-blue-700 border-blue-200"
								: row.original.status === "completed"
									? "bg-gray-50 text-gray-700 border-gray-200"
									: "bg-red-50 text-red-700 border-red-200",
					)}
				>
					{row.original.status === "ongoing" ? (
						<IconCircleDashedCheck className="h-4 w-4" />
					) : row.original.status === "upcoming" ? (
						<IconCircleDashed className="h-4 w-4" />
					) : row.original.status === "completed" ? (
						<IconCircleDashedCheck className="h-4 w-4" />
					) : (
						<IconCircleDashed className="h-4 w-4" />
					)}
					{row.original.status === "ongoing"
						? "تجري الآن"
						: row.original.status === "upcoming"
							? "مُجدولة"
							: row.original.status === "completed"
								? "مكتملة"
								: "ملغية"}
				</Badge>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<div className="flex gap-1">
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() => handleViewDetails(row.original)}
					>
						<IconEye className="h-4 w-4" />
					</Button>
					<EditMatchSheet match={row.original} onSuccess={handleUpdateMatch} />
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() => handleDeleteMatch(row.original)}
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
			<div className="flex items-center justify-end gap-2">
				<AddMatchSheet cafeId="cafe1" onSuccess={handleAddMatch} />

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
					<Suspense
						fallback={
							<TableBody className="**:data-[slot=table-cell]:first:w-8">
								<TableRow>
									<TableCell colSpan={5} className="h-24">
										<div className="flex items-center justify-center">
											<Icons.spinner />
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						}
					>
						<MatchesTableContent
							table={table}
							columns={columns}
							onDataChange={handleOnDataChange}
						/>
					</Suspense>
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
			<DeleteMatchDialog
				matchData={matchToDelete}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setMatchToDelete(null);
				}}
				onSuccess={() => {}}
			/>
			<MatchDetailsSheet
				isOpen={isDetailsModalOpen}
				onClose={handleCloseDetailsModal}
				match={selectedMatch}
			/>
		</div>
	);
}

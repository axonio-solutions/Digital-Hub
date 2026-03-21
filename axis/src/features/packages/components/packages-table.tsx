import {
	IconAlertCircle,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleDashed,
	IconCircleDashedCheck,
	IconEdit,
	IconEye,
	IconEyeCog,
	IconPlus,
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
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { deleteMultiplePackagesFn } from "@/fn/packages";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback, useState } from "react";
import { toast } from "sonner";
import { packagesQueries } from "../packages-queries";
import type { PackageWithItems } from "../packages.types";
import { CreatePackageDialog } from "./modals/create-package";
import { DeletePackageDialog } from "./modals/delete-package";
import { EditPackageDialog } from "./modals/edit-package";
import { PackageDetailsModal } from "./modals/package-details";
import { PackageTableContent } from "./packages-table-content";

export function PackageTable() {
	const [data, setData] = useState<PackageWithItems[]>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedPackage, setSelectedPackage] =
		useState<PackageWithItems | null>(null);
	const [selectedPackageForEdit, setSelectedPackageForEdit] =
		useState<PackageWithItems | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [packageToDelete, setPackageToDelete] = useState<
		Pick<PackageWithItems, "id" | "name"> | undefined
	>(undefined);

	const queryClient = useQueryClient();

	const handleOnDataChange = useCallback((newData: PackageWithItems[]) => {
		setData((prev) => {
			if (JSON.stringify(prev) !== JSON.stringify(newData)) {
				return newData;
			}
			return prev;
		});
	}, []);

	const handleViewDetails = (packageData: PackageWithItems) => {
		setSelectedPackage(packageData);
		setIsDetailsModalOpen(true);
	};

	const handleCloseDetailsModal = () => {
		setIsDetailsModalOpen(false);
	};

	const handleEditPackage = (packageData: PackageWithItems) => {
		setSelectedPackageForEdit(packageData);
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setSelectedPackageForEdit(null);
	};

	const handleDeletePackage = (
		packageData: Pick<PackageWithItems, "id" | "name">,
	) => {
		setPackageToDelete(packageData);
		setIsDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setPackageToDelete(undefined);
	};

	const columns: ColumnDef<PackageWithItems>[] = [
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
			accessorKey: "name",
			header: "اسم الباقة",
			cell: ({ row }) => <div>{row.original.name}</div>,
			enableHiding: false,
		},
		{
			accessorKey: "price",
			header: "سعر الباقة",
			cell: ({ row }) => (
				<div className="flex gap-1 items-center">
					{row.original.items.reduce((sum, item) => {
						return sum + Number(item.price);
					}, 0)}
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
							: "text-muted-foreground",
					)}
				>
					{row.original.status === "active" ? (
						<IconCircleDashedCheck className="h-4 w-4" />
					) : (
						<IconCircleDashed className="h-4 w-4" />
					)}
					{row.original.status === "active" ? "نشط" : "غير نشط"}
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
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() => handleEditPackage(row.original)}
					>
						<IconEdit className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-7 cursor-pointer"
						onClick={() =>
							handleDeletePackage({
								id: row.original.id,
								name: row.original.name,
							})
						}
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

	const bulkDeleteMutation = useMutation({
		mutationFn: async (selectedPackageIds: string[]) => {
			return await deleteMultiplePackagesFn({ data: selectedPackageIds });
		},
		onMutate: async (packageIds) => {
			const count = packageIds.length;
			await queryClient.cancelQueries(packagesQueries.list());

			const previousPackages = queryClient.getQueryData<PackageWithItems[]>(
				packagesQueries.list().queryKey,
			);

			queryClient.setQueryData(
				packagesQueries.list().queryKey,
				(old: PackageWithItems[] = []) => {
					return old.filter((pkg) => !packageIds.includes(pkg.id));
				},
			);

			table.resetRowSelection();

			toast.success(
				`تم حذف ${count} ${count === 1 ? "باكيج" : "باكيجات"} بنجاح`,
			);

			return {
				previousPackages,
			};
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				packagesQueries.list().queryKey,
				context?.previousPackages,
			);
			toast.error("فشل في حذف الباكيجات المحددة");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: packagesQueries.list().queryKey,
			});
		},
	});

	const handleBulkDelete = async () => {
		const selectedRows = table.getSelectedRowModel().rows;
		const packageIds = selectedRows.map((row) => row.original.id);
		bulkDeleteMutation.mutate(packageIds);
	};

	return (
		<div className="relative flex flex-col gap-4 overflow-auto">
			<div className="flex items-center justify-end gap-2">
				{/* Delete button */}
				{table.getSelectedRowModel().rows.length > 0 && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								size="sm"
								className="me-auto cursor-pointer"
								variant="outline"
							>
								<IconTrash
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								حذف
								<span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
									{table.getSelectedRowModel().rows.length}
								</span>
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="sm:max-w-sm rounded-xl">
							<div className="flex flex-col items-center gap-2">
								<div
									className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600"
									aria-hidden="true"
								>
									<IconAlertCircle className="size-5" />
								</div>
								<AlertDialogHeader>
									<AlertDialogTitle>
										هل أنت متأكد من حذف الباكيجات المحددة؟
									</AlertDialogTitle>
									<AlertDialogDescription>
										هذا الإجراء لا يمكن التراجع عنه. سيتم حذف{" "}
										{table.getSelectedRowModel().rows.length}{" "}
										{table.getSelectedRowModel().rows.length === 1
											? "باكيج"
											: "باكيجات"}{" "}
										نهائيًا.
									</AlertDialogDescription>
								</AlertDialogHeader>
							</div>
							<AlertDialogFooter className="sm:justify-center gap-2">
								<AlertDialogCancel className="flex-1 cursor-pointer">
									إلغاء
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleBulkDelete}
									disabled={bulkDeleteMutation.status === "pending"}
									className="flex-1 cursor-pointer"
								>
									{bulkDeleteMutation.status === "pending" ? (
										<Icons.spinner />
									) : (
										"حذف"
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
				<Button
					className="cursor-pointer"
					size="sm"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<IconPlus className="size-4" />
					إضافة باكيج جديد
				</Button>
				<DropdownMenu dir="rtl">
					<DropdownMenuTrigger asChild>
						<Button className="cursor-pointer" variant="outline" size="sm">
							<IconEyeCog className="h-4 w-4" />
							<span className="hidden lg:inline">تخصيص أعمدة الجدول</span>
							<span className="lg:hidden">تخصيص الأعمدة</span>
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
										{column.columnDef.header as string}
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
						<PackageTableContent
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
							className="hidden h-8 w-8 p-0 lg:flex rtl:rotate-180"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">الصفحة الأولى</span>
							<IconChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8 rtl:rotate-180"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">الصفحة السابقة</span>
							<IconChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8 rtl:rotate-180"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">الصفحة التالية</span>
							<IconChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden size-8 lg:flex rtl:rotate-180"
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

			{/* Package Details Modal */}
			<PackageDetailsModal
				isOpen={isDetailsModalOpen}
				onClose={handleCloseDetailsModal}
				packageData={selectedPackage}
			/>

			{/* Create Package Modal */}
			<CreatePackageDialog
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={() => {}}
			/>

			{/* Edit Package Modal */}
			{selectedPackageForEdit && (
				<EditPackageDialog
					packageData={selectedPackageForEdit as PackageWithItems}
					isOpen={isEditModalOpen}
					onClose={handleCloseEditModal}
					onSuccess={() => {}}
				/>
			)}

			{/* Delete Package Modal */}
			{packageToDelete && (
				<DeletePackageDialog
					packageData={packageToDelete}
					isOpen={isDeleteModalOpen}
					onClose={handleCloseDeleteModal}
					onSuccess={() => {}}
				/>
			)}
		</div>
	);
}

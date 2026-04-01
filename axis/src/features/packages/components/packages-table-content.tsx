import { useSuspenseQuery } from "@tanstack/react-query";
import {
	
	
	flexRender
} from "@tanstack/react-table";
import { useEffect } from "react";
import { packagesQueries } from "../packages-queries";
import type {ColumnDef, Table as TableType} from "@tanstack/react-table";
import type { PackageWithItems } from "../packages.types";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export function PackageTableContent({
	table,
	columns,
	onDataChange,
}: {
	table: TableType<PackageWithItems>;
	columns: Array<ColumnDef<PackageWithItems, unknown>>;
	onDataChange: (data: Array<PackageWithItems>) => void;
}) {
	const { data } = useSuspenseQuery(packagesQueries.list());

	useEffect(() => {
		onDataChange(data);
	}, [onDataChange, data]);

	return (
		<TableBody className="**:data-[slot=table-cell]:first:w-8">
			{table.getRowModel().rows?.length ? (
				table.getRowModel().rows.map((row) => (
					<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
						لا توجد نتائج.
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	);
}

import { useSuspenseQuery } from "@tanstack/react-query";
import {
	
	
	flexRender
} from "@tanstack/react-table";
import { useEffect } from "react";
import { eventsQueries } from "../queries";
import type {ColumnDef, Table as TableType} from "@tanstack/react-table";
import type { MatchEventTableRow } from "../schema";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export function MatchesTableContent({
	table,
	columns,
	onDataChange,
}: {
	table: TableType<MatchEventTableRow>;
	columns: Array<ColumnDef<MatchEventTableRow, unknown>>;
	onDataChange: (data: Array<MatchEventTableRow>) => void;
}) {
	const { data } = useSuspenseQuery(eventsQueries.matchEvents());

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

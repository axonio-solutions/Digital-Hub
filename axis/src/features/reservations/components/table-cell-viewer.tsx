import type { z } from "zod";

import type { schema } from "./cafe-reservations-table";
import { ReservationDetailsSheet } from "./sheets/reservation-details";

interface TableCellViewerProps {
	item: z.infer<typeof schema>;
}

export function TableCellViewer({ item }: TableCellViewerProps) {
	return (
		<ReservationDetailsSheet reservation={item}>
			{item.guestName}
		</ReservationDetailsSheet>
	);
}

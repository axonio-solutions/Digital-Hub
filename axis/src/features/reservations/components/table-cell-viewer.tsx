import { ReservationDetailsSheet } from "./sheets/reservation-details";
import type { z } from "zod";

import type { schema } from "./cafe-reservations-table";

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

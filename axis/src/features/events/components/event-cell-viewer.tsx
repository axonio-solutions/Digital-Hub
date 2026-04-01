import { EventDetailsSheet } from "./sheets/event-details";
import type { z } from "zod";

import type { eventsSchema } from "./events-table";

interface EventCellViewerProps {
	item: z.infer<typeof eventsSchema>;
}

export function EventCellViewer({ item }: EventCellViewerProps) {
	return <EventDetailsSheet event={item}>{item.eventName}</EventDetailsSheet>;
}

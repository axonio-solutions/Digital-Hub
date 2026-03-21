import type { z } from "zod";

import type { eventsSchema } from "./events-table";
import { EventDetailsSheet } from "./sheets/event-details";

interface EventCellViewerProps {
	item: z.infer<typeof eventsSchema>;
}

export function EventCellViewer({ item }: EventCellViewerProps) {
	return <EventDetailsSheet event={item}>{item.eventName}</EventDetailsSheet>;
}

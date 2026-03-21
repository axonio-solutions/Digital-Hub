import { z } from "zod";

export const bookingSettingsSchema = z.object({
	advance_booking_window: z.number().int().positive(),
	booking_duration: z.number().positive(),
	cancellation_policy: z.string(),
});

export type BookingSettingsFormValues = z.infer<typeof bookingSettingsSchema>;

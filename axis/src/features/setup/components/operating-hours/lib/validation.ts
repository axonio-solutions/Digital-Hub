import { z } from "zod";

const timeSlotSchema = z
	.object({
		from: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
			message: "Invalid time format. Use HH:MM",
		}),
		to: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
			message: "Invalid time format. Use HH:MM",
		}),
	})
	.refine(
		(data) => {
			const fromMinutes =
				Number.parseInt(data.from.split(":")[0]) * 60 +
				Number.parseInt(data.from.split(":")[1]);

			const toMinutes =
				Number.parseInt(data.to.split(":")[0]) * 60 +
				Number.parseInt(data.to.split(":")[1]);

			return toMinutes > fromMinutes;
		},
		{
			message: "Closing time must be after opening time",
			path: ["to"],
		},
	);

const dayScheduleSchema = z.object({
	enabled: z.boolean(),
	timeSlots: z
		.array(timeSlotSchema)
		.nonempty({
			message: "At least one time slot is required when day is enabled",
		})
		.optional()
		.default([{ from: "09:00", to: "17:00" }]),
});

export const operatingHoursSchema = z.object({
	SUNDAY: dayScheduleSchema,
	MONDAY: dayScheduleSchema,
	TUESDAY: dayScheduleSchema,
	WEDNESDAY: dayScheduleSchema,
	THURSDAY: dayScheduleSchema,
	FRIDAY: dayScheduleSchema,
	SATURDAY: dayScheduleSchema,
});

export const operatingHourSchema = z.object({
	id: z.string().uuid().optional(),
	cafe_id: z.string().uuid(),
	day_of_week: z.number().min(0).max(6),
	opening_time: z.string(),
	closing_time: z.string(),
	is_closed: z.boolean().default(false),
});

import type { cafeOperatingHours } from "@/db/schema/cafes-schema";
import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { operatingHoursSchema } from "./validation";

export type TimeSlot = {
	from: string;
	to: string;
};

export type DaySchedule = {
	enabled: boolean;
	timeSlots: TimeSlot[];
};

export type OperatingHoursData = {
	SUNDAY: DaySchedule;
	MONDAY: DaySchedule;
	TUESDAY: DaySchedule;
	WEDNESDAY: DaySchedule;
	THURSDAY: DaySchedule;
	FRIDAY: DaySchedule;
	SATURDAY: DaySchedule;
};

export type CafeOperatingHour = InferSelectModel<typeof cafeOperatingHours>;

export const DAY_MAPPING: Record<number, keyof OperatingHoursData> = {
	0: "SUNDAY",
	1: "MONDAY",
	2: "TUESDAY",
	3: "WEDNESDAY",
	4: "THURSDAY",
	5: "FRIDAY",
	6: "SATURDAY",
};

export const DAY_TRANSLATIONS: Record<string, string> = {
	SUNDAY: "الأحد",
	MONDAY: "الإثنين",
	TUESDAY: "الثلاثاء",
	WEDNESDAY: "الأربعاء",
	THURSDAY: "الخميس",
	FRIDAY: "الجمعة",
	SATURDAY: "السبت",
};

export type OperatingHoursFormData = z.infer<typeof operatingHoursSchema>;

// For component use
export type OperatingHoursState = OperatingHoursData;

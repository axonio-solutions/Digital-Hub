import { z } from "zod";

const areaItemSchema = z.object({
	id: z.string(),
	price: z.string(),
});

const packageItemSchema = z.object({
	id: z.string(),
	price: z.string(),
});

export const matchDetailsSchema = z.object({
	matchId: z.number(),
	startTime: z.string(),
	homeTeam: z.string(),
	awayTeam: z.string(),
});

// Define form schema for editing matches
export const editMatchSchema = z.object({
	matchName: z.string().min(2, { message: "اسم المباراة مطلوب" }),
	date: z.string().min(1, { message: "تاريخ المباراة مطلوب" }),
	time: z.string().min(1, { message: "وقت المباراة مطلوب" }),
	totalCapacity: z
		.number()
		.min(1, { message: "السعة الكلية يجب أن تكون 1 على الأقل" }),
	remainingCapacity: z
		.number()
		.min(0, { message: "السعة المتبقية يجب أن تكون 0 على الأقل" }),
	status: z.string().min(1, { message: "حالة المباراة مطلوبة" }),
	notes: z.string().optional(),
});

export const createMatchSchema = z.object({
	// League selection
	league: z.string().min(1, "يجب اختيار الدوري"),

	// Match selection from API
	match: z.string().min(1, "يجب اختيار المباراة"),

	// Areas selection (multi-select)
	areas: z.array(areaItemSchema).min(1, "يجب تحديد منطقة واحدة على الأقل"),

	// Capacity & Price
	capacity: z.number().min(0, "يجب أن تكون السعة 0 أو أكثر"),

	// Optional packages
	packages: z.array(packageItemSchema).default([]),
});

export const createFootballMatchSchema = z.object({
	formData: createMatchSchema,
	matchDetails: matchDetailsSchema,
});

export const matchEventTableSchema = z.object({
	id: z.string(),
	match: z.string(),
	date: z.string(),
	time: z.string(),
	status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
	capacity: z.object({
		total: z.number(),
		remaining: z.number(),
	}),
});

export const editMatchEntrySchema = matchEventTableSchema.extend({
	status: z.string(),
	notes: z.string().optional(),
});

export type AreaItem = z.infer<typeof areaItemSchema>;
export type PackageItem = z.infer<typeof packageItemSchema>;
export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
export type MatchDetails = z.infer<typeof matchDetailsSchema>;
export type MatchEventTableRow = z.infer<typeof matchEventTableSchema>;
export type CreateFootballMatchInput = z.infer<
	typeof createFootballMatchSchema
>;

export type EditMatchFormValues = z.infer<typeof editMatchSchema>;
export type EditMatchEntry = z.infer<typeof editMatchEntrySchema>;

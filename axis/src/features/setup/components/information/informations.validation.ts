import { z } from "zod";

export const amenitiesSchema = z.object({
	version: z.string(),
	amenities: z.object({
		basic: z.record(z.boolean()).default({}),
		services: z.record(z.boolean()).default({}),
		features: z.record(z.boolean()).default({}),
		custom: z.record(z.boolean()).default({}),
	}),
	details: z.object({
		wifi: z
			.object({
				has_password: z.boolean().default(false),
				speed: z.number().nullable(),
			})
			.optional(),
		reservations: z
			.object({
				min_group_size: z.number().nullable(),
				max_group_size: z.number().nullable(),
			})
			.optional(),
	}),
});

export type CafeAmenities = z.infer<typeof amenitiesSchema>;

export const cafeProfileSchema = z.object({
	// Basic Information
	name_ar: z
		.string()
		.min(3, { message: "يجب أن يكون اسم المقهى 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز اسم المقهى 50 حرفًا" }),
	name_en: z
		.string()
		.min(3, { message: "يجب أن يكون اسم المقهى 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز اسم المقهى 50 حرفًا" }),
	slug: z
		.string()
		.min(3, { message: "يجب أن يكون الرابط 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز الرابط 50 حرفًا" })
		.regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
			message:
				"يجب أن يحتوي الرابط على أحرف إنجليزية صغيرة وأرقام وشرطات فقط، وأن يبدأ وينتهي بحرف أو رقم",
		}),
	description: z
		.string()
		.max(500, { message: "يجب أن لا يتجاوز الوصف 500 حرف" })
		.optional()
		.or(z.literal("")),
	// Location Information
	administrative_region: z.string().optional().or(z.literal("")),
	governorate: z.string().optional().or(z.literal("")),
	street: z
		.string()
		.max(100, { message: "يجب أن لا يتجاوز عنوان الشارع 100 حرف" })
		.optional()
		.or(z.literal("")),
	// Classification
	type_id: z.string().min(1, { message: "يرجى اختيار نوع المقهى" }),
	categories: z
		.array(z.string())
		.max(3, { message: "يمكنك اختيار 3 تصنيفات كحد أقصى" })
		.optional()
		.default([]),
	// Contact details
	business_email: z
		.string()
		.email({ message: "يرجى إدخال بريد إلكتروني صحيح" })
		.optional()
		.or(z.literal("")),
	business_phone: z
		.string()
		.regex(/^(05|966)[0-9]{8,9}$/, {
			message: "يرجى إدخال رقم هاتف سعودي صحيح",
		})
		.optional()
		.or(z.literal("")),
	// Amenities
	amenities: amenitiesSchema,
});

export const cafeInformationFormSchema = z.object({
	// Basic Information
	name_ar: z
		.string()
		.min(3, { message: "يجب أن يكون اسم المقهى 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز اسم المقهى 50 حرفًا" }),
	name_en: z
		.string()
		.min(3, { message: "يجب أن يكون اسم المقهى 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز اسم المقهى 50 حرفًا" }),
	slug: z
		.string()
		.min(3, { message: "يجب أن يكون الرابط 3 أحرف على الأقل" })
		.max(50, { message: "يجب أن لا يتجاوز الرابط 50 حرفًا" })
		.regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
			message:
				"يجب أن يحتوي الرابط على أحرف إنجليزية صغيرة وأرقام وشرطات فقط، وأن يبدأ وينتهي بحرف أو رقم",
		}),
	description: z
		.string()
		.max(500, { message: "يجب أن لا يتجاوز الوصف 500 حرف" })
		.optional()
		.or(z.literal("")),
	// Location Information
	administrative_region: z.string().optional().or(z.literal("")),
	governorate: z.string().optional().or(z.literal("")),
	street: z
		.string()
		.max(100, { message: "يجب أن لا يتجاوز عنوان الشارع 100 حرف" })
		.optional()
		.or(z.literal("")),
	// Classification
	type_id: z.string().min(1, { message: "يرجى اختيار نوع المقهى" }),
	categories: z
		.array(z.string())
		.max(3, { message: "يمكنك اختيار 3 تصنيفات كحد أقصى" })
		.optional()
		.default([]),
});

export const updateCafeSchema = cafeProfileSchema.extend({
  id: z.string().uuid({ message: "معرف المقهى غير صالح" }),
});

export const contactFormSchema = z.object({
	business_phone: z.string().min(9, {
		message: "رقم الهاتف يجب أن يكون على الأقل 9 أرقام",
	}),
	business_email: z.string().email({
		message: "الرجاء إدخال بريد إلكتروني صالح",
	}),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

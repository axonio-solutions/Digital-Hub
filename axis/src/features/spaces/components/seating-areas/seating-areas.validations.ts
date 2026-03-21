import { z } from "zod";

export const areaSchema = z.object({
	name_ar: z.string().min(2, { message: "مطلوب إدخال الاسم بالعربي" }),
	name_en: z.string().min(2, { message: "مطلوب إدخال الاسم بالإنجليزي" }),
	capacity: z.number().int().positive(),
	base_price: z.number().nonnegative(),
});

export const updateAreaSchema = areaSchema.extend({
	id: z.string().uuid({ message: "معرف المقهى غير صالح" }),
});

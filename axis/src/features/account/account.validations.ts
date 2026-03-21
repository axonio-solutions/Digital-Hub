import { z } from "zod";

export const accountDetailsSchema = z.object({
	fullName: z
		.string()
		.min(2, { message: "يجب أن يحتوي الاسم على حرفين على الأقل" }),
	phoneNumber: z
		.string()
		.regex(/^(\+\d{1,3})?\d{9,10}$/, { message: "يرجى إدخال رقم هاتف صحيح" }),
});

export const passwordResetSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, { message: "يرجى إدخال كلمة المرور الحالية" }),
		newPassword: z
			.string()
			.min(8, { message: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "كلمات المرور غير متطابقة",
		path: ["confirmPassword"],
	});

export type AccountDetailsFormValues = z.infer<typeof accountDetailsSchema>;
export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

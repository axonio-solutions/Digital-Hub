import { z } from "zod";
import { UI_CONFIG, USER_ROLES } from "../constants/config";
import {
	NAME_REQUIREMENTS,
	PASSWORD_REQUIREMENTS,
	PHONE_REQUIREMENTS,
} from "../constants/validation";

export function createValidationSchemas() {
	const emailSchema = z.object({
		email: z
			.string()
			.min(1, "Please enter a valid email address")
			.email("Please enter a valid email address")
			.max(UI_CONFIG.INPUT_MAX_LENGTH),
	});

	const passwordSchema = z.object({
		password: z
			.string()
			.min(
				PASSWORD_REQUIREMENTS.MIN_LENGTH,
				`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
			)
			.max(PASSWORD_REQUIREMENTS.MAX_LENGTH)
			.regex(
				PASSWORD_REQUIREMENTS.REGEX.NUMBERS,
				"Password must include at least one number",
			),
	});

	const phoneSchema = z.object({
		phone: z
			.string()
			.min(PHONE_REQUIREMENTS.MIN_LENGTH, "Please enter a valid phone number")
			.max(PHONE_REQUIREMENTS.MAX_LENGTH)
			.regex(PHONE_REQUIREMENTS.REGEX, "Phone number format is invalid"),
	});

	const emailLoginSchema = emailSchema.merge(passwordSchema);
	const phoneLoginSchema = phoneSchema;
	const loginSchema = z.union([emailLoginSchema, phoneLoginSchema]);

	const registrationSchema = emailSchema
		.merge(passwordSchema)
		.merge(phoneSchema)
		.extend({
			fullName: z
				.string()
				.min(
					NAME_REQUIREMENTS.MIN_LENGTH,
					`Name must be at least ${NAME_REQUIREMENTS.MIN_LENGTH} characters`,
				)
				.max(NAME_REQUIREMENTS.MAX_LENGTH),
			confirmPassword: z.string(),
			role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.CAFE_OWNER]),
			acceptTerms: z
				.boolean()
				.refine(
					(val) => val === true,
					"You must accept the terms and conditions",
				),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords do not match",
			path: ["confirmPassword"],
		});

	const forgotPasswordSchema = emailSchema;

	const resetPasswordSchema = passwordSchema
		.extend({
			confirmPassword: z.string(),
			token: z.string().optional(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords do not match",
			path: ["confirmPassword"],
		});

	const completeRegistrationSchema = z
		.object({
			role: z
				.enum([USER_ROLES.CUSTOMER, USER_ROLES.CAFE_OWNER])
				.default(USER_ROLES.CUSTOMER),
		})
		.merge(phoneSchema);

	return {
		loginSchema,
		emailLoginSchema,
		phoneLoginSchema,
		registrationSchema,
		forgotPasswordSchema,
		resetPasswordSchema,
		completeRegistrationSchema,
	};
}

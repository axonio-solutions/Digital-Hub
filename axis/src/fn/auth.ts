import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import type {
	CompleteRegistrationFormData,
	ForgotPasswordFormData,
	RegistrationFormData,
	ResetPasswordFormData,
} from "@/features/auth/validation";
import type { SocialProvider } from "better-auth/social-providers";
import { db, eq } from "@/db";
import { users } from "@/db/schema";
import { AUTH_ROUTES } from "@/features/auth/constants/config";
import { authMiddleware } from "@/features/auth/guards/auth";
import { auth } from "@/lib/auth";

export const getUser = createServerFn().handler(async () => {
	const request = getWebRequest();
	const data = await auth.api.getSession({
		headers: request?.headers as Headers,
		query: {
			disableCookieCache: true,
		},
	});

	if (!data || !data?.user) {
		return null;
	}

	return {
		...data.user,
		cafeId: data.cafeId,
	};
});

export const loginFn = createServerFn({
	method: "POST",
	response: "raw",
})
	.validator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const response = await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password,
				callbackURL: AUTH_ROUTES.DASHBOARD,
			},
			asResponse: true,
		});
		return response;
	});

export const loginWithOAuthFn = createServerFn()
	.validator((d: { provider: SocialProvider }) => d)
	.handler(async ({ data }) => {
		const { url } = await auth.api.signInSocial({
			body: {
				provider: data.provider,
				callbackURL: AUTH_ROUTES.DASHBOARD,
			},
		});

		throw redirect({
			href: url,
		});
	});

export const registerFn = createServerFn()
	.validator((d: RegistrationFormData) => d)
	.handler(async ({ data }) => {
		const { email, fullName, password, role, phone } = data;
		const { user } = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: fullName,
				user_type: role,
				phone,
				callbackURL: AUTH_ROUTES.DASHBOARD,
			},
		});

		if (user) {
			return {
				success: true,
			};
		}
	});

export const completeRegistrationFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator((d: CompleteRegistrationFormData) => d)
	.handler(async ({ data, context }) => {
		const { role, phone } = data;

		const [user] = await db
			.update(users)
			.set({ user_type: role, phone })
			.where(eq(users.id, context.user.id))
			.returning();

		if (!user) {
			return {
				success: false,
			};
		}

		return {
			success: true,
			user: {
				...user,
				cafeId: context.cafeId,
			},
		};
	});

export const forgotPasswordFn = createServerFn({
	method: "POST",
})
	.validator((d: ForgotPasswordFormData) => d)
	.handler(async ({ data }) => {
		const { email } = data;
		const { status } = await auth.api.forgetPassword({
			body: {
				email,
				redirectTo: AUTH_ROUTES.RESET_PASSWORD,
			},
		});

		return {
			success: status,
		};
	});

export const resetPasswordFn = createServerFn()
	.validator((d: ResetPasswordFormData) => d)
	.handler(async ({ data }) => {
		const { password, token } = data;

		const { status } = await auth.api.resetPassword({
			body: {
				newPassword: password,
				token,
			},
		});

		return {
			success: status,
		};
	});

import {  betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, customSession } from "better-auth/plugins";
import EmailVerification from "./emails/email-verification";
import PasswordReset from "./emails/reset-password";
import { resend } from "./resend";
import type {BetterAuthOptions} from "better-auth";
import { clientEnvs, serverEnvs } from "@/utils/env";
import { db } from "@/db";
import { getCafeIdForUser } from "@/data-access/cafes";

const options = {
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	rateLimit: {
		max: 3,
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true,
		minPasswordLength: 6,
		resetPasswordTokenExpiresIn: 3600, // 1 hour
		sendResetPassword: async ({ user, url }) => {
			if (clientEnvs.VITE_EMAIL_PROVIDER === "console") {
				console.info(
					`Email From: ${serverEnvs.EMAIL_FROM} | Email To: ${user.email}`,
				);
				console.info(`Password Reset Link: ${url}`);
				return;
			}
			await resend.emails.send({
				from: serverEnvs.EMAIL_FROM as string,
				to: [user.email],
				subject: "Reset your password",
				react: PasswordReset({ resetLink: url, userName: user.name }),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600, // 1 hour
		sendVerificationEmail: async ({ user, url }) => {
			if (clientEnvs.VITE_EMAIL_PROVIDER === "console") {
				console.info(
					`Email From: ${serverEnvs.EMAIL_FROM} | Email To: ${user.email}`,
				);
				console.info(`Email Verification Link: ${url}`);
				return;
			}
			await resend.emails.send({
				from: serverEnvs.EMAIL_FROM as string,
				to: [user.email],
				subject: "Verify your email address",
				react: EmailVerification({ verificationLink: url }),
			});
		},
	},
	socialProviders: {
		google: {
			clientId: serverEnvs.GOOGLE_CLIENT_ID as string,
			clientSecret: serverEnvs.GOOGLE_CLIENT_SECRET as string,
		},
	},

	user: {
		deleteUser: {
			enabled: true,
		},
		additionalFields: {
			user_type: {
				type: "string",
				required: false,
				input: true,
			},
			account_status: {
				type: "string",
				required: false,
				input: false,
			},
			phone: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24, // 1 day
		},
	},
	plugins: [admin()],
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-up/email") {
				return;
			}
			if (!ctx.body?.user_type) {
				throw new APIError("BAD_REQUEST", {
					message: "Please select a user type",
				});
			}
			if (!ctx.body?.phone || ctx.body?.phone === "") {
				throw new APIError("BAD_REQUEST", {
					message: "Please enter a valid phone number",
				});
			}
		}),
	},
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	...options,
	plugins: [
		...(options.plugins ?? []),
		customSession(async ({ user, session }) => {
			const cafeId = await getCafeIdForUser(user.id);
			return {
				user,
				session,
				cafeId,
			};
		}, options),
	],
});

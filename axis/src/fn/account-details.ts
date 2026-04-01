import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { db, eq } from "@/db";
import { users } from "@/db/schema";
import {
	accountDetailsSchema,
	passwordResetSchema,
} from "@/features/account/account.validations";
import { authMiddleware } from "@/features/auth/guards/auth";
import { auth } from "@/lib/auth";

export const accountDetailsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(accountDetailsSchema)
	.handler(
		async ({
			context: {
				user: { id },
			},
			data,
		}) => {
			if (!id) {
				throw new Error("User ID not found");
			}

			try {
				const req = getWebRequest();
				if (!req) {
					throw new Error("Request not found");
				}

				// Update user details
				await auth.api.updateUser({
					body: {
						phone: data.phoneNumber,
						name: data.fullName,
					},
					headers: req.headers,
				});

				return { success: true };
			} catch (error) {
				console.error("Error updating user:", error);
				throw error;
			}
		},
	);

export const deactivateAccountFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		if (!user?.id) {
			throw new Error("User ID not found");
		}

		try {
			const req = getWebRequest();
			if (!req) {
				throw new Error("Request not found");
			}

			await db.transaction(async (tx) => {
				await tx
					.update(users)
					.set({
						account_status: "inactive",
					})
					.where(eq(users.id, user.id));
			});

			return { success: true };
		} catch (error) {
			console.error("Error deactivating account:", error);
			throw error;
		}
	});

export const changePasswordFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(passwordResetSchema)
	.handler(async ({ data }) => {
		try {
			const req = getWebRequest();
			if (!req) {
				throw new Error("Request not found");
			}

			await auth.api.changePassword({
				body: {
					newPassword: data.newPassword,
					currentPassword: data.currentPassword,
				},
				headers: req.headers,
			});
			await auth.api.getSession({
				headers: req.headers,
			});
		} catch (error) {
			console.error("Error changing password:", error);
			throw error;
		}
	});

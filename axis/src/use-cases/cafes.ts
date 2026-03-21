import { getCafeIdForUser, validateCafeOwnership } from "@/data-access/cafes";
import { authClient } from "@/lib/auth-client";

export async function getCurrentUserCafeId({
	userId,
}: { userId: string }): Promise<{
	success: boolean;
	cafeId?: string;
	error?: string;
}> {
	try {
		const cafeId = await getCafeIdForUser(userId);

		if (!cafeId) {
			return {
				success: false,
				error: "No cafe found for this user",
			};
		}

		return {
			success: true,
			cafeId,
		};
	} catch (error) {
		console.error("Error in getCurrentUserCafeId:", error); // TODO: handle errors properly
		return {
			success: false,
			error: "Failed to get cafe ID",
		};
	}
}

export async function validateCurrentUserCafeOwnership(
	cafeId: string,
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const { data, error: userError } = await authClient.getSession();

		if (userError || !data?.user) {
			return {
				success: false,
				error: "User not authenticated",
			};
		}

		const user = data.user;

		const isOwner = await validateCafeOwnership(user.id, cafeId);

		if (!isOwner) {
			return {
				success: false,
				error: "You do not have access to this cafe",
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error in validateCurrentUserCafeOwnership:", error); // TODO: handle errors properly
		return {
			success: false,
			error: "Failed to validate cafe ownership",
		};
	}
}

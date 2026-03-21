import { db, eq } from "@/db";
import { cafes } from "@/db/schema/cafes-schema";

export async function getCafeIdForUser(userId: string): Promise<string | null> {
	try {
		const userCafe = await db.query.cafes.findFirst({
			where: eq(cafes.owner_id, userId),
			columns: {
				id: true,
			},
		});

		return userCafe?.id || null;
	} catch (error) {
		console.error("Error fetching cafe ID for user:", error); // TODO: handle errors properly
		return null;
	}
}

export async function validateCafeOwnership(
	userId: string,
	cafeId: string,
): Promise<boolean> {
	try {
		const cafeExists = await db.query.cafes.findFirst({
			where: (cafes) => eq(cafes.id, cafeId) && eq(cafes.owner_id, userId),
			columns: {
				id: true,
			},
		});

		return !!cafeExists;
	} catch (error) {
		console.error("Error validating cafe ownership:", error); // TODO: handle errors properly
		return false;
	}
}

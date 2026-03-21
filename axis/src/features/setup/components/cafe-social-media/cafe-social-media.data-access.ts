import { db, eq } from "@/db";
import { cafeSocialLinks } from "@/db/schema";
import type { SocialMediaEntry } from "./validation";

export const getCafeSocialMedia = async (cafeId: string) => {
	try {
		return await db.query.cafeSocialLinks.findMany({
			columns: {
				platform: true,
				handle: true,
			},
			where: eq(cafeSocialLinks.cafe_id, cafeId),
			orderBy: (links, { asc }) => [asc(links.display_order)],
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch social media: ${error.message}`);
		}
		throw error;
	}
};

export const updateCafeSocialMedia = async (
	cafeId: string,
	entries: SocialMediaEntry[],
) => {
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(cafeSocialLinks)
				.where(eq(cafeSocialLinks.cafe_id, cafeId));

			await tx.insert(cafeSocialLinks).values(
				entries.map((entry) => ({
					cafe_id: cafeId,
					...entry,
				})),
			);
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to update social media: ${error.message}`);
		}
		throw error;
	}
};

import { db, eq } from "@/db";
import { cafes } from "@/db/schema";
import type { UpdateCafeContactInformationInputs } from "../information/informations.types";

export const updateCafeContactInformations = async (
	inputs: UpdateCafeContactInformationInputs,
	cafeId: string,
) => {
	try {
		return await db.transaction(async (tx) => {
			const [updateCafeContactInformations] = await tx
				.update(cafes)
				.set({
					business_phone: inputs.business_phone,
					business_email: inputs.business_email,
				})
				.where(eq(cafes.id, cafeId))
				.returning();

			return updateCafeContactInformations;
		});
	} catch (error) {
		console.error("Error update cafe contact information");
	}
};

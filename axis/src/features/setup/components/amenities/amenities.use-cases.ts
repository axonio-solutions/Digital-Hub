import type { CafeAmenities } from "../information/informations.validation";
import { updateAmenities } from "./amenities.data-access";

export const updateAmenitiesUseCase = async (
	amenities: CafeAmenities,
	cafeId: string,
) => {
	try {
		const result = await updateAmenities(amenities, cafeId);
		return result;
	} catch (error) {
		console.error("Error updating amenities");
		throw error;
	}
};

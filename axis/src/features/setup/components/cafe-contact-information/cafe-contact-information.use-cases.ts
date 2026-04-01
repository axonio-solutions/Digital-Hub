import { updateCafeContactInformations } from "./cafe-contact-information.data-access";
import type { UpdateCafeContactInformationInputs } from "../information/informations.types";

export const updateCafeContactInformationsUseCase = async (
	cafeContactInformations: UpdateCafeContactInformationInputs,
	cafeId: string,
) => {
	try {
		const result = await updateCafeContactInformations(
			cafeContactInformations,
			cafeId,
		);
		return result;
	} catch (error) {
		console.error("Error update cafe contact information");
		throw error;
	}
};

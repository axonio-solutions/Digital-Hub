import {
	getCafeInformation,
	getSpaceSettings,
	updateCafeInformation,
} from "./informations.data-access";
import type { UpdateCafeInputs } from "./informations.types";

export async function getCafeInformationUseCase(cafeId: string) {
	try {
		const cafe = await getCafeInformation(cafeId);
		return cafe;
	} catch (error) {
		console.error("Error fetching cafe information:", error);
		throw error;
	}
}

export async function updateCafeInformationUseCase(
	data: UpdateCafeInputs,
	cafeId: string,
) {
	try {
		await updateCafeInformation(data, cafeId);
		return {
			success: true,
		};
	} catch (error) {
		return {
			success: false,
		};
	}
}

export async function getSpaceSettingsUseCase(cafeId: string) {
	try {
		return await getSpaceSettings(cafeId);
	} catch (error) {
		console.error("Error fetching space settings:", error);
		throw error;
	}
}

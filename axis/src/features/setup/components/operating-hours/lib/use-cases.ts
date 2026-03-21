import { getCafeOperatingHours, updateCafeOperatingHours } from "./data-access";
import { transformOperatingHoursToFormValues } from "./helpers";
import type { OperatingHoursData } from "./types";

export async function fetchCafeOperatingHours(cafeId: string) {
	const hours = await getCafeOperatingHours(cafeId);
	return transformOperatingHoursToFormValues(hours);
}

export async function updateHours(cafeId: string, data: OperatingHoursData) {
	return await updateCafeOperatingHours(cafeId, data);
}

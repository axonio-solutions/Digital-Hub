import {
	updateMaxCapacity,
	updateSeatingSettings,
} from "./seating-settings.data-access";
import type { BookingSettingsFormValues } from "./validation";

export const updateSeatingSettingsUseCase = async (
	cafeId: string,
	entry: BookingSettingsFormValues,
) => {
	try {
		return await updateSeatingSettings(cafeId, entry);
	} catch (error) {
		console.error("Error updating seating settings", error);
	}
};

export const updateMaxCapacityUseCase = async (
	cafeId: string,
	entry: number,
) => {
	try {
		return await updateMaxCapacity(cafeId, entry);
	} catch (error) {
		console.error("Error updating seating settings", error);
	}
};

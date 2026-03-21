import {
  createSeatingArea,
  deleteSeatingArea,
  getSeatingAreas,
  updateSeatingArea,
} from "./seating-areas.data-access";
import type { AreaInput, UpdateArea } from "./seating-areas.types";

export const getSeatingAreasUseCase = async (cafeId: string) => {
  try {
    return await getSeatingAreas(cafeId);
  } catch (error) {
    console.error("Error fetching Seating Areas");
    throw error;
  }
};

export const createSeatingAreaUseCase = async (
	cafeId: string,
	entry: AreaInput,
) => {
	try {
		return await createSeatingArea(cafeId, entry);
	} catch (error) {
		console.error("Error updating Seating Area");
		throw error;
	}
};

export const deleteSeatingAreaUseCase = async (areaId: string) => {
  try {
    await deleteSeatingArea(areaId);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting seating area", error);
    return {
      success: false,
      message: "error deleting area",
    };
  }
};

export const updateSeatingAreaUseCase = async (entry: UpdateArea) => {
  try {
    return await updateSeatingArea(entry);
  } catch (error) {
    console.error("Error updating seating area");
    throw error;
  }
};

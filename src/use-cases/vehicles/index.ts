import { fetchUserVehicles, insertVehicle, deleteVehicleByIdAndUser } from "@/data-access/vehicles";

/**
 * Axis Layer 4: Use Cases for Vehicles
 */

export async function getVehiclesUseCase(userId: string) {
    try {
        const vehicles = await fetchUserVehicles(userId);
        return { success: true, data: vehicles };
    } catch (error) {
        console.error("Error in getVehiclesUseCase:", error);
        return { success: false, error: "Failed to fetch vehicles" };
    }
}

export async function addVehicleUseCase(data: any) {
    try {
        const newVehicle = await insertVehicle(data);
        return { success: true, data: newVehicle[0] };
    } catch (error) {
        console.error("Error in addVehicleUseCase:", error);
        return { success: false, error: "Failed to add vehicle" };
    }
}

export async function removeVehicleUseCase(vehicleId: string, userId: string) {
    try {
        await deleteVehicleByIdAndUser(vehicleId, userId);
        return { success: true };
    } catch (error) {
        console.error("Error in removeVehicleUseCase:", error);
        return { success: false, error: "Failed to remove vehicle" };
    }
}

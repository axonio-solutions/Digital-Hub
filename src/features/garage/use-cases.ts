import { fetchUserVehicles, insertVehicle, deleteVehicleByIdAndUser } from "@/data-access/vehicles";

/**
 * Axis Layer 4: Use Cases for Garage/Vehicles
 */

export async function getVehiclesUseCase(userId: string) {
    return await fetchUserVehicles(userId);
}

export async function addVehicleUseCase(data: any) {
    return await insertVehicle(data);
}

export async function removeVehicleUseCase(vehicleId: string, userId: string) {
    return await deleteVehicleByIdAndUser(vehicleId, userId);
}

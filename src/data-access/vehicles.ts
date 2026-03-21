import { db } from "@/db";
import { vehicles } from "@/db/schema/vehicles";
import { eq, desc, and } from "drizzle-orm";

export async function fetchUserVehicles(userId: string) {
  return await db.query.vehicles.findMany({
    where: eq(vehicles.userId, userId),
    orderBy: [desc(vehicles.createdAt)],
  });
}

export async function insertVehicle(data: any) {
  return await db.insert(vehicles).values({
    userId: data.userId,
    make: data.make,
    model: data.model,
    year: data.year,
    vin: data.vin,
    licensePlate: data.licensePlate,
  }).returning();
}

export async function deleteVehicleByIdAndUser(vehicleId: string, userId: string) {
  await db.delete(vehicles).where(
      and(
          eq(vehicles.id, vehicleId),
          eq(vehicles.userId, userId)
      )
  );
}

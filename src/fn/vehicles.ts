import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";

/**
 * Axis Layer 3: Vehicles Actions
 */

export const getVehiclesServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { getVehiclesUseCase } = await import("@/use-cases/vehicles/index");
    return await getVehiclesUseCase(data);
  });

export const addVehicleServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { addVehicleUseCase } = await import("@/use-cases/vehicles/index");
    return await addVehicleUseCase(data);
  });

export const removeVehicleServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string, userId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { removeVehicleUseCase } = await import("@/use-cases/vehicles/index");
    return await removeVehicleUseCase(data.id, data.userId);
  });

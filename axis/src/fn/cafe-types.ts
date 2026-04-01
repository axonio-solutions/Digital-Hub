// cafe-types.server.ts
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import { getCafeTypesUseCase } from "@/features/setup/components/cafe-type-selector/cafe-types.use-cases";

export const fetchCafeTypesFn = createServerFn({
  method: "GET",
})
.middleware([authMiddleware])
.handler(async () => {
  try {
    const types = await getCafeTypesUseCase();
    return types;
  } catch (error) {
    console.error("Failed to fetch cafe types:", error);
    throw error;
  }
});
// cafe-categories.server.ts
import { authMiddleware } from "@/features/auth/guards/auth";
import { getAllCafeCategoriesUseCase, getCafeCategoriesUseCase } from "@/features/setup/components/cafe-categories-selector/cafe-categories.use-cases";

import { createServerFn } from "@tanstack/react-start";

export const fetchAllCafeCategoriesFn = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async () => {
    try {
      return await getAllCafeCategoriesUseCase();
    } catch (error) {
      console.error("Failed to fetch cafe categories:", error);
      throw error;
    }
  });

export const fetchCafeCategoriesFn = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const cafeId = context.cafeId;
      if (!cafeId) throw new Error("Cafe ID required");
      return await getCafeCategoriesUseCase(cafeId);
    } catch (error) {
      console.error("Failed to fetch cafe's categories:", error);
      throw error;
    }
  });
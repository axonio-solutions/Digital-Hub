// cafe-categories.use-cases.ts
import {
    getAllCafeCategories,
    getCafeCategories,
  } from "./cafe-categories.data-access";
  import type { CafeCategory } from "./cafe-categories.types";
  
  export async function getAllCafeCategoriesUseCase(): Promise<Array<CafeCategory>> {
    try {
      return await getAllCafeCategories();
    } catch (error) {
      console.error("Error fetching cafe categories:", error);
      throw error;
    }
  }
  
  export async function getCafeCategoriesUseCase(
    cafeId: string
  ): Promise<Array<string>> {
    try {
      return await getCafeCategories(cafeId);
    } catch (error) {
      console.error("Error fetching cafe's categories:", error);
      throw error;
    }
  }
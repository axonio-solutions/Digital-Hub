// cafe-types.use-cases.ts
import { getCafeTypes } from "./cafe-types.data-access";
import type { CafeType } from "./cafe-types.types";

export async function getCafeTypesUseCase(): Promise<Array<CafeType>> {
  try {
    const types = await getCafeTypes();
    return types;
  } catch (error) {
    console.error("Error fetching cafe types:", error);
    throw error;
  }
}
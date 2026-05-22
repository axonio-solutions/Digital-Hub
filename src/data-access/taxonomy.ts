import { count, desc, eq } from 'drizzle-orm'
import type {
  BrandInput,
  CategoryInput,
} from '@/features/taxonomy/validations/taxonomy'
import { db } from '@/db'
import { partCategories, sparePartRequests, vehicleBrands } from '@/db/schema'

export async function getPartCategories() {
  return await db
    .select({
      id: partCategories.id,
      name: partCategories.name,
      description: partCategories.description,
      imageUrl: partCategories.imageUrl,
      status: partCategories.status,
      createdAt: partCategories.createdAt,
      updatedAt: partCategories.updatedAt,
      requestsCount: count(sparePartRequests.id),
    })
    .from(partCategories)
    .leftJoin(
      sparePartRequests,
      eq(sparePartRequests.categoryId, partCategories.id),
    )
    .groupBy(
      partCategories.id,
      partCategories.name,
      partCategories.description,
      partCategories.imageUrl,
      partCategories.status,
      partCategories.createdAt,
      partCategories.updatedAt,
    )
    .orderBy(desc(partCategories.createdAt))
}

export async function getVehicleBrands() {
  return await db
    .select({
      id: vehicleBrands.id,
      brand: vehicleBrands.brand,
      imageUrl: vehicleBrands.imageUrl,
      clusterOrigin: vehicleBrands.clusterOrigin,
      clusterRegion: vehicleBrands.clusterRegion,
      status: vehicleBrands.status,
      createdAt: vehicleBrands.createdAt,
      updatedAt: vehicleBrands.updatedAt,
      requestsCount: count(sparePartRequests.id),
    })
    .from(vehicleBrands)
    .leftJoin(
      sparePartRequests,
      eq(sparePartRequests.brandId, vehicleBrands.id),
    )
    .groupBy(
      vehicleBrands.id,
      vehicleBrands.brand,
      vehicleBrands.imageUrl,
      vehicleBrands.clusterOrigin,
      vehicleBrands.clusterRegion,
      vehicleBrands.status,
      vehicleBrands.createdAt,
      vehicleBrands.updatedAt,
    )
    .orderBy(desc(vehicleBrands.createdAt))
}

export async function createPartCategory(data: CategoryInput) {
  return await db.insert(partCategories).values(data).returning()
}

export async function updatePartCategory(
  id: string,
  data: Partial<CategoryInput>,
) {
  return await db
    .update(partCategories)
    .set(data)
    .where(eq(partCategories.id, id))
    .returning()
}

export async function deletePartCategory(id: string) {
  return await db
    .delete(partCategories)
    .where(eq(partCategories.id, id))
    .returning()
}

export async function createVehicleBrand(data: BrandInput) {
  return await db.insert(vehicleBrands).values(data).returning()
}

export async function updateVehicleBrand(
  id: string,
  data: Partial<BrandInput>,
) {
  return await db
    .update(vehicleBrands)
    .set(data)
    .where(eq(vehicleBrands.id, id))
    .returning()
}

export async function deleteVehicleBrand(id: string) {
  return await db
    .delete(vehicleBrands)
    .where(eq(vehicleBrands.id, id))
    .returning()
}

import { db } from '@/db'
import { partCategories, vehicleBrands, sparePartRequests } from '@/db/schema'
import { desc, eq, getTableColumns, count } from 'drizzle-orm'
import { CategoryInput, BrandInput } from '@/features/taxonomy/validations/taxonomy'

export async function getPartCategories() {
  return await db
    .select({
      id: partCategories.id,
      name: partCategories.name,
      status: partCategories.status,
      createdAt: partCategories.createdAt,
      updatedAt: partCategories.updatedAt,
      requestsCount: count(sparePartRequests.id),
    })
    .from(partCategories)
    .leftJoin(sparePartRequests, eq(sparePartRequests.categoryId, partCategories.id))
    .groupBy(
      partCategories.id,
      partCategories.name,
      partCategories.status,
      partCategories.createdAt,
      partCategories.updatedAt
    )
    .orderBy(desc(partCategories.createdAt))
}

export async function getVehicleBrands() {
  return await db
    .select({
      id: vehicleBrands.id,
      brand: vehicleBrands.brand,
      clusterOrigin: vehicleBrands.clusterOrigin,
      clusterRegion: vehicleBrands.clusterRegion,
      status: vehicleBrands.status,
      createdAt: vehicleBrands.createdAt,
      updatedAt: vehicleBrands.updatedAt,
      requestsCount: count(sparePartRequests.id),
    })
    .from(vehicleBrands)
    .leftJoin(sparePartRequests, eq(sparePartRequests.brandId, vehicleBrands.id))
    .groupBy(
      vehicleBrands.id,
      vehicleBrands.brand,
      vehicleBrands.clusterOrigin,
      vehicleBrands.clusterRegion,
      vehicleBrands.status,
      vehicleBrands.createdAt,
      vehicleBrands.updatedAt
    )
    .orderBy(desc(vehicleBrands.createdAt))
}

export async function createPartCategory(data: CategoryInput) {
  return await db.insert(partCategories).values(data).returning()
}

export async function updatePartCategory(id: string, data: Partial<CategoryInput>) {
  return await db.update(partCategories).set(data).where(eq(partCategories.id, id)).returning()
}

export async function deletePartCategory(id: string) {
  return await db.delete(partCategories).where(eq(partCategories.id, id)).returning()
}

export async function createVehicleBrand(data: BrandInput) {
  return await db.insert(vehicleBrands).values(data).returning()
}

export async function updateVehicleBrand(id: string, data: Partial<BrandInput>) {
  return await db.update(vehicleBrands).set(data).where(eq(vehicleBrands.id, id)).returning()
}

export async function deleteVehicleBrand(id: string) {
  return await db.delete(vehicleBrands).where(eq(vehicleBrands.id, id)).returning()
}

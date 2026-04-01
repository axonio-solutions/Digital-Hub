import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function findUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  })
}

export async function updateUserMetadata(userId: string, data: any) {
  return await db
    .update(users)
    .set({
      role: data.role,
      account_status: data.account_status,
      phoneNumber: data.phoneNumber || data.phone,
      whatsappNumber: data.whatsappNumber,
      storeName: data.storeName || null,
      companyAddress: data.companyAddress || null,
      commercialRegister: data.commercialRegister || null,
      wilaya: data.wilaya,
      address: data.address,
      city: data.city,
    })
    .where(eq(users.id, userId))
}

export async function fetchAllUsers() {
  return await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    // @ts-ignore
    with: {
      sellerBrands: { with: { brand: true } },
      sellerCategories: { with: { category: true } }
    },
  })
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  return await db.update(users).set({ banned: isBanned }).where(eq(users.id, userId))
}

export async function updateUserStatus(userId: string, status: string) {
  return await db.update(users).set({ account_status: status as any }).where(eq(users.id, userId))
}

export async function updateProfileQuery(
  userId: string,
  data: Partial<typeof users.$inferSelect>,
) {
  return await db.update(users).set(data).where(eq(users.id, userId))
}

export async function deactivateUserQuery(userId: string) {
  return await db
    .update(users)
    .set({ account_status: 'deactivated' })
    .where(eq(users.id, userId))
}

export async function deleteUserQuery(userId: string) {
  return await db.delete(users).where(eq(users.id, userId))
}

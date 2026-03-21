import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email)
  });
}

export async function updateUserMetadata(userId: string, data: any) {
  return await db.update(users).set({
    role: data.role,
    phone: data.phoneNumber || data.phone,
    storeName: data.storeName || null,
    companyAddress: data.companyAddress || null,
    commercialRegister: data.commercialRegister || null,
  }).where(eq(users.id, userId));
}

export async function fetchAllUsers() {
  return await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      banned: true,
      createdAt: true,
    }
  });
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  await db.update(users)
    .set({ banned: isBanned })
    .where(eq(users.id, userId));
}

export async function updateProfileQuery(userId: string, data: Partial<typeof users.$inferSelect>) {
  return await db.update(users)
    .set(data)
    .where(eq(users.id, userId));
}

export async function deactivateUserQuery(userId: string) {
  return await db.update(users)
    .set({ isDeactivated: true })
    .where(eq(users.id, userId));
}

export async function deleteUserQuery(userId: string) {
  return await db.delete(users)
    .where(eq(users.id, userId));
}

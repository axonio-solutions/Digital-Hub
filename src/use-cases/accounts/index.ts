import { createServerFn } from '@tanstack/react-start'
import {
  accountActionSchema,
  updateProfileSchema,
} from '@/types/account-schemas'
import {
  deactivateUserQuery,
  deleteUserQuery,
  updateProfileQuery,
} from '@/data-access/users'

/**
 * Axis Layer 4: Use Cases (Domain Business Logic)
 */

export async function updateProfileUseCase(userId: string, updates: any) {
  const data = { ...updates }
  if (data.phoneNumber) {
    data.phone = data.phoneNumber
    delete data.phoneNumber
  }
  return await updateProfileQuery(userId, data)
}

export async function deactivateAccountUseCase(userId: string) {
  return await deactivateUserQuery(userId)
}

export async function deleteAccountUseCase(userId: string) {
  return await deleteUserQuery(userId)
}

/**
 * Axis Layer 3: Server Functions for Users/Accounts
 */

export const updateProfileServerFn = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: any }) => {
    const validated = updateProfileSchema.parse(data)
    const { userId, ...updates } = validated
    return await updateProfileUseCase(userId, updates)
  },
)

export const deactivateAccountServerFn = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: any }) => {
  const validated = accountActionSchema.parse(data)
  return await deactivateAccountUseCase(validated.userId)
})

export const deleteAccountServerFn = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: any }) => {
    const validated = accountActionSchema.parse(data)
    return await deleteAccountUseCase(validated.userId)
  },
)

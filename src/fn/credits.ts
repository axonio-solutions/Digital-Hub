import { createServerFn } from '@tanstack/react-start'
import {
  adminMiddleware,
  authMiddleware,
  sellerMiddleware,
} from '@/features/auth/guards/auth'
import {
  approveCreditRequestUseCase,
  createCreditPackageUseCase,
  getCreditPackagesUseCase,
  getCreditRequestsUseCase,
  getCreditTransactionsUseCase,
  getPendingCreditRequestsCountUseCase,
  getRevenueMetricsUseCase,
  getSellerCreditsUseCase,
  getSellersWithCreditsUseCase,
  grantCreditsUseCase,
  rejectCreditRequestUseCase,
  requestCreditsUseCase,
  toggleCreditPackageStatusUseCase,
  updateCreditPackageUseCase,
} from '@/use-cases/credits/index'

export const getSellersWithCreditsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getSellersWithCreditsUseCase()
  })

export const grantCreditsServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    (data: { sellerId: string; amount: number; description?: string }) => data,
  )
  .handler(async ({ data, context }) => {
    return await grantCreditsUseCase(
      data.sellerId,
      data.amount,
      context.user.id,
      data.description,
    )
  })

export const getCreditTransactionsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: { sellerId?: string }) => data)
  .handler(async ({ data }) => {
    return await getCreditTransactionsUseCase(data.sellerId)
  })

export const getCreditPackagesServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getCreditPackagesUseCase()
  })

export const getActiveCreditPackagesServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    return await getCreditPackagesUseCase()
  })

export const createCreditPackageServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    (data: {
      name: string
      credits: number
      price: number
      description?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    return await createCreditPackageUseCase(data)
  })

export const updateCreditPackageServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    (data: {
      id: string
      name?: string
      credits?: number
      price?: number
      description?: string
      isActive?: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await updateCreditPackageUseCase(id, updateData)
  })

export const toggleCreditPackageStatusServerFn = createServerFn({
  method: 'POST',
})
  .middleware([adminMiddleware])
  .inputValidator((data: { id: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    return await toggleCreditPackageStatusUseCase(data.id, data.isActive)
  })

export const getRevenueMetricsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getRevenueMetricsUseCase()
  })

export const getMyCreditBalanceServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const balance = await getSellerCreditsUseCase(context.user.id)
    const transactions = await getCreditTransactionsUseCase(context.user.id)
    return { balance, transactions }
  })

// --- Credit Requests (Seller) ---

export const requestCreditsServerFn = createServerFn({ method: 'POST' })
  .middleware([sellerMiddleware])
  .inputValidator((data: { credits: number; packageId?: string }) => data)
  .handler(async ({ data, context }) => {
    return await requestCreditsUseCase(
      context.user.id,
      data.credits,
      data.packageId,
    )
  })

// --- Credit Requests (Admin) ---

export const getCreditRequestsServerFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: { status?: string }) => data)
  .handler(async ({ data }) => {
    return await getCreditRequestsUseCase(data.status)
  })

export const approveCreditRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    return await approveCreditRequestUseCase(data.id, context.user.id)
  })

export const rejectCreditRequestServerFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { id: string; adminNote?: string }) => data)
  .handler(async ({ data, context }) => {
    return await rejectCreditRequestUseCase(
      data.id,
      context.user.id,
      data.adminNote,
    )
  })

export const getPendingCreditRequestsCountServerFn = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return await getPendingCreditRequestsCountUseCase()
  })

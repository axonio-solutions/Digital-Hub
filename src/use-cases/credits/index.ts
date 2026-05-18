import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creditRequests } from '@/db/schema'
import {
  createCreditPackage,
  createCreditRequest,
  deductCredits,
  fetchActiveCreditPackages,
  fetchCreditPackages,
  fetchCreditRequests,
  fetchCreditTransactions,
  fetchPendingCreditRequestsCount,
  fetchRevenueMetrics,
  fetchSellerCredits,
  fetchSellersWithCredits,
  grantCredits,
  toggleCreditPackageStatus,
  updateCreditPackage,
} from '@/data-access/credits'

export async function getSellersWithCreditsUseCase() {
  return await fetchSellersWithCredits()
}

export async function getSellerCreditsUseCase(sellerId: string) {
  return await fetchSellerCredits(sellerId)
}

export async function grantCreditsUseCase(
  sellerId: string,
  amount: number,
  adminId: string,
  description?: string,
  packageId?: string,
) {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }
  const txn = await grantCredits(sellerId, amount, 'purchase', adminId, description, packageId)
  return { success: true, transaction: txn }
}

export async function getCreditTransactionsUseCase(sellerId?: string) {
  return await fetchCreditTransactions(sellerId, 100, 0)
}

export async function getCreditPackagesUseCase() {
  return await fetchCreditPackages()
}

export async function getActiveCreditPackagesUseCase() {
  return await fetchActiveCreditPackages()
}

export async function createCreditPackageUseCase(data: {
  name: string
  credits: number
  price: number
  description?: string
}) {
  return await createCreditPackage(data)
}

export async function updateCreditPackageUseCase(
  id: string,
  data: Partial<{
    name: string
    credits: number
    price: number
    description: string
    isActive: boolean
  }>,
) {
  return await updateCreditPackage(id, data)
}

export async function toggleCreditPackageStatusUseCase(id: string, isActive: boolean) {
  return await toggleCreditPackageStatus(id, isActive)
}

export async function getRevenueMetricsUseCase() {
  return await fetchRevenueMetrics()
}

export async function deductCreditForQuoteUseCase(sellerId: string, quoteId: string) {
  return await deductCredits(sellerId, 1, quoteId)
}

export async function requestCreditsUseCase(
  sellerId: string,
  credits: number,
  packageId?: string,
) {
  if (credits <= 0) {
    return { success: false, error: 'Credit amount must be positive' }
  }
  const req = await createCreditRequest(sellerId, credits, packageId)
  return { success: true, data: req }
}

export async function getCreditRequestsUseCase(status?: string) {
  return await fetchCreditRequests(status)
}

export async function approveCreditRequestUseCase(
  id: string,
  adminId: string,
): Promise<{ success: boolean; error?: string }> {
  const requests = await fetchCreditRequests('pending')
  const req = requests.find((r) => r.id === id)
  if (!req) return { success: false, error: 'Request not found' }

  await db
    .update(creditRequests)
    .set({ status: 'approved', adminId, updatedAt: new Date() })
    .where(eq(creditRequests.id, id))

  // Grant the credits
  await grantCredits(req.sellerId, req.credits, 'credit_request_approved', adminId, `Credit request approved — ${req.credits} credits`)

  return { success: true }
}

export async function rejectCreditRequestUseCase(
  id: string,
  adminId: string,
  adminNote?: string,
) {
  const [updated] = await db
    .update(creditRequests)
    .set({ status: 'rejected', adminId, adminNote, updatedAt: new Date() })
    .where(eq(creditRequests.id, id))
    .returning()
  return updated
}

export async function getPendingCreditRequestsCountUseCase() {
  return await fetchPendingCreditRequestsCount()
}

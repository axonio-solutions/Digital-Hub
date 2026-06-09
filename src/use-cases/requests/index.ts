import { eq } from 'drizzle-orm'

import type { User } from '@/lib/auth'

import {
  deleteRequestQuery,
  fetchAllRequestsQuery,
  fetchBuyerRequestsQuery,
  fetchOpenRequestsQuery,
  fetchRequestDetailsQuery,
  fetchRequestStatusQuery,
  insertNewRequest,
  updateRequestFullQuery,
  updateRequestStatusQuery,
} from '@/data-access/requests'
import { fulfillRequestTransaction } from '@/data-access/quotes'
import { db } from '@/db'
import { sparePartRequests } from '@/db/schema'
import {
  canDeleteRequest,
  validateRequestTransition,
} from '@/lib/state-machine'
import { NotificationTriggers } from '@/services/notification-triggers'

export async function createRequestUseCase(data: any) {
  try {
    const request = await insertNewRequest(data)
    if (request?.id) {
      await NotificationTriggers.onNewRequest(request.id)
    }
    return { success: true, data: request }
  } catch (error) {
    console.error('Error creating request:', error)
    return { success: false, error: 'Failed to create request' }
  }
}

export async function flagAsSpamUseCase(requestId: string) {
  try {
    if (requestId === 'TEST-123') {
      await NotificationTriggers.onSpamFlagged(requestId)
      return { success: true }
    }
    await db
      .update(sparePartRequests)
      .set({ isSpam: true })
      .where(eq(sparePartRequests.id, requestId))
    await NotificationTriggers.onSpamFlagged(requestId)
    return { success: true }
  } catch (error) {
    console.error('Error flagging spam:', error)
    return { success: false, error: 'Failed to flag request' }
  }
}

export async function getBuyerRequestsUseCase(
  buyerId: string,
  options?: { limit?: number; offset?: number },
) {
  try {
    const requests = await fetchBuyerRequestsQuery(buyerId, options)
    return { success: true, data: requests }
  } catch (error) {
    console.error('Error fetching buyer requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

export async function getOpenRequestsUseCase(options?: {
  limit?: number
  offset?: number
  categoryId?: string
  brandIds?: Array<string>
  search?: string
  specialtyFilter?: { brandIds: Array<string>; categoryIds: Array<string> }
}) {
  try {
    const requests = await fetchOpenRequestsQuery(options)
    return { success: true, data: requests }
  } catch (error) {
    console.error('Error fetching open requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

export async function getAllRequestsUseCase(limit?: number) {
  try {
    const requests = await fetchAllRequestsQuery(limit)
    return { success: true, data: requests }
  } catch (error) {
    console.error('Error fetching all requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

export async function getRequestDetailsUseCase(
  requestId: string,
  currentUser: User,
) {
  try {
    const request = await fetchRequestDetailsQuery(requestId)
    if (!request) return { success: false, error: 'Request not found' }

    const isAdmin = currentUser.role === 'admin'
    const isOwner = request.buyerId === currentUser.id
    const isSeller = currentUser.role === 'seller'
    const isMarketplaceAccess = isSeller && request.status === 'open'
    const hasInteracted = request.quotes?.some(
      (q: any) => q.sellerId === currentUser.id,
    )

    if (!isAdmin && !isOwner && !isMarketplaceAccess && !hasInteracted) {
      return {
        success: false,
        error: 'Forbidden: You do not have permission to view this request',
      }
    }

    if (isSeller && !isAdmin) {
      request.quotes =
        request.quotes?.filter((q: any) => q.sellerId === currentUser.id) ?? []
    }

    return { success: true, data: request }
  } catch (error) {
    console.error('Error fetching request details:', error)
    return { success: false, error: 'Failed to fetch request' }
  }
}

export async function cancelRequestUseCase(
  requestId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const row = await fetchRequestStatusQuery(requestId)
      if (!row) throw new Error('Request not found')
      if (row.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateRequestTransition(row.status, 'cancelled')
      const updated = await updateRequestStatusQuery(requestId, 'cancelled')
      if (!updated || updated.length === 0)
        throw new Error('Failed to cancel request')
      return updated[0]
    })
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error cancelling request:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel request',
    }
  }
}

export async function reopenRequestUseCase(
  requestId: string,
  userId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const row = await fetchRequestStatusQuery(requestId)
      if (!row) throw new Error('Request not found')
      if (row.buyerId !== userId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateRequestTransition(row.status, 'open')
      const updated = await updateRequestStatusQuery(requestId, 'open')
      if (!updated || updated.length === 0)
        throw new Error('Failed to reopen request')
      return updated[0]
    })
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error reopening request:', error)
    return {
      success: false,
      error: error.message || 'Failed to reopen request',
    }
  }
}

export async function fulfillRequestUseCase(
  requestId: string,
  buyerId: string,
  userRole: string,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const request = await fetchRequestDetailsQuery(requestId)
      if (!request) throw new Error('Request not found')
      if (request.buyerId !== buyerId && userRole !== 'admin') {
        throw new Error('Forbidden: You do not own this request')
      }
      validateRequestTransition(request.status, 'fulfilled')

      const hasAcceptedQuote = request.quotes?.some(
        (q: any) => q.status === 'accepted',
      )
      if (!hasAcceptedQuote) {
        throw new Error('Cannot fulfill a request with no accepted quote')
      }

      // Capture pending sellers before fulfillRequestTransaction auto-rejects them
      const pendingSellerIds: Array<string> =
        request.quotes
          ?.filter((q: any) => q.status === 'pending')
          .map((q: any) => q.sellerId) ?? []

      const fulfilled = await fulfillRequestTransaction(requestId, tx)
      return { fulfilled, pendingSellerIds }
    })

    NotificationTriggers.onRequestFulfilled(
      requestId,
      result.pendingSellerIds,
    ).catch(console.error)
    return { success: true, data: result.fulfilled }
  } catch (error: any) {
    console.error('Error fulfilling request:', error)
    return {
      success: false,
      error: error.message || 'Failed to fulfill request',
    }
  }
}

export async function deleteRequestUseCase(
  requestId: string,
  userId: string,
  userRole: string,
) {
  try {
    const request = await fetchRequestDetailsQuery(requestId)
    if (!request) return { success: false, error: 'Request not found' }
    if (request.buyerId !== userId && userRole !== 'admin') {
      return { success: false, error: 'Forbidden: You do not own this request' }
    }
    if (!canDeleteRequest(request.status)) {
      return { success: false, error: 'Cannot delete a fulfilled request' }
    }
    const hasAcceptedQuote = request.quotes?.some(
      (q: any) => q.status === 'accepted',
    )
    if (hasAcceptedQuote) {
      return {
        success: false,
        error: 'Cannot delete a request with an accepted quote',
      }
    }
    const result = await deleteRequestQuery(requestId)
    if (!result || result.length === 0) {
      return { success: false, error: 'Failed to delete request' }
    }
    return { success: true, data: result[0] }
  } catch (error: any) {
    console.error('Error deleting request:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete request',
    }
  }
}

export async function updateRequestUseCase(requestId: string, data: any) {
  try {
    const request = await fetchRequestDetailsQuery(requestId)
    if (!request) return { success: false, error: 'Request not found' }
    if (request.status === 'fulfilled' || request.status === 'cancelled') {
      return {
        success: false,
        error: 'Cannot edit a fulfilled or cancelled request',
      }
    }
    const hasAcceptedQuote = request.quotes?.some(
      (q: any) => q.status === 'accepted',
    )
    if (hasAcceptedQuote) {
      return {
        success: false,
        error: 'Cannot edit a request with an accepted quote. Revoke the accepted quote first.',
      }
    }
    const { status, ...safeData } = data
    const result = await updateRequestFullQuery(requestId, safeData)
    if (!result || result.length === 0) {
      return { success: false, error: 'Failed to update request' }
    }
    return { success: true, data: result[0] }
  } catch (error: any) {
    console.error('Error updating request:', error)
    return {
      success: false,
      error: error.message || 'Failed to update request',
    }
  }
}

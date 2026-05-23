/**
 * REST API endpoint registry.
 *
 * Maps logical operation names to their /api/v1/* paths on the server.
 * Use apiUrl(key) to get the path, then pass it to fetchApi() in api-client.ts.
 */

export type ServerFnKey = keyof typeof ENDPOINT_PATHS

const ENDPOINT_PATHS = {
  // Auth / Session
  getUser: '/api/v1/session',

  // Onboarding
  completeOnboarding: '/api/v1/onboarding/complete',

  // Buyer requests
  fetchBuyerRequests: '/api/v1/requests/buyer',
  fetchOpenRequests: '/api/v1/requests/open',
  fetchPublicOpenRequests: '/api/v1/requests/public',
  fetchRequestDetails: '/api/v1/requests/details',
  createRequest: '/api/v1/requests/create',
  cancelRequest: '/api/v1/requests/cancel',
  reopenRequest: '/api/v1/requests/reopen',
  deleteRequest: '/api/v1/requests/delete',
  updateRequest: '/api/v1/requests/update',
  fulfillRequest: '/api/v1/requests/fulfill',

  // Quotes
  getSellerQuotes: '/api/v1/quotes/seller',
  fetchSellerStats: '/api/v1/quotes/stats',
  createQuote: '/api/v1/quotes/create',
  updateQuote: '/api/v1/quotes/update',
  acceptQuote: '/api/v1/quotes/accept',
  rejectQuote: '/api/v1/quotes/reject',
  revokeQuote: '/api/v1/quotes/revoke',
  unrejectQuote: '/api/v1/quotes/unreject',
  retractQuote: '/api/v1/quotes/retract',
  sendReminder: '/api/v1/quotes/remind',

  // Notifications
  fetchUnreadNotifications: '/api/v1/notifications/unread',
  markNotificationRead: '/api/v1/notifications/read',
  markAllNotificationsRead: '/api/v1/notifications/read-all',

  // Users / Account
  updateProfile: '/api/v1/users/profile',
  deactivateAccount: '/api/v1/users/deactivate',
  deleteAccount: '/api/v1/users/delete',

  // Credits
  getMyCreditBalance: '/api/v1/credits/balance',
  getActiveCreditPackages: '/api/v1/credits/packages',
  requestCredits: '/api/v1/credits/request',

  // Support
  submitSupportTicket: '/api/v1/support/ticket',

  // Taxonomy
  getPublicTaxonomy: '/api/v1/taxonomy',
} as const

export function apiUrl(key: ServerFnKey): string {
  return ENDPOINT_PATHS[key]
}

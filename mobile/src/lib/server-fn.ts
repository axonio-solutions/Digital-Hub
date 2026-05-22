/**
 * Builds the dev-server URL for a TanStack Start server function.
 *
 * Format observed in this repo's Vite dev mode:
 *   /_serverFn/<base64url({ file, export })>
 *
 * where:
 *   file   = `/@id/src/fn/<filename>.ts?tss-serverfn-split`
 *   export = `<fnName>_createServerFn_handler`
 *
 * The `/@id/` prefix is Vite's. After `vite build`, TanStack Start emits
 * different server-function paths (typically with content-hashed names),
 * so the URLs produced here MUST be regenerated for production. Treat this
 * helper as dev-only and gate it behind __DEV__ before shipping.
 */
function base64url(input: string): string {
  // RN/Hermes provides global btoa.
  const b64 = btoa(input)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface ServerFnRef {
  /** File under `src/fn/` containing the server function, e.g. `'requests'`. */
  file: string
  /** Exported name of the server function, e.g. `'getPublicTaxonomyServerFn'`. */
  fn: string
}

export function serverFnUrl(ref: ServerFnRef): string {
  const payload = JSON.stringify({
    file: `/@id/src/fn/${ref.file}.ts?tss-serverfn-split`,
    export: `${ref.fn}_createServerFn_handler`,
  })
  return `/_serverFn/${base64url(payload)}`
}

/**
 * Centralized references to every server function the mobile app calls.
 * Add new entries here rather than scattering string literals across screens.
 * Each entry corresponds to an export in the web app's `src/fn/<file>.ts`.
 */
export const SERVER_FNS = {
  getPublicTaxonomy: { file: 'requests', fn: 'getPublicTaxonomyServerFn' },
  fetchPublicOpenRequests: {
    file: 'requests',
    fn: 'fetchPublicOpenRequestsServerFn',
  },
  fetchBuyerRequests: { file: 'requests', fn: 'fetchBuyerRequestsServerFn' },
  fetchOpenRequests: { file: 'requests', fn: 'fetchOpenRequestsServerFn' },
  createRequest: { file: 'requests', fn: 'createRequestServerFn' },
  fetchRequestDetails: {
    file: 'requests',
    fn: 'fetchRequestDetailsServerFn',
  },
  completeOnboarding: {
    file: 'onboarding',
    fn: 'completeOnboardingFn',
  },
  getUser: { file: 'auth', fn: 'getUser' },
  cancelRequest: { file: 'requests', fn: 'cancelRequestServerFn' },
  reopenRequest: { file: 'requests', fn: 'reopenRequestServerFn' },
  deleteRequest: { file: 'requests', fn: 'deleteRequestServerFn' },
  updateRequest: { file: 'requests', fn: 'updateRequestServerFn' },
  acceptQuote: { file: 'quotes', fn: 'acceptQuoteServerFn' },
  rejectQuote: { file: 'quotes', fn: 'rejectQuoteServerFn' },
  revokeQuote: { file: 'quotes', fn: 'revokeQuoteServerFn' },
  unrejectQuote: { file: 'quotes', fn: 'unrejectQuoteServerFn' },
  fulfillRequest: { file: 'requests', fn: 'fulfillRequestServerFn' },
  retractQuote: { file: 'quotes', fn: 'retractQuoteServerFn' },
  sendReminder: { file: 'quotes', fn: 'sendReminderServerFn' },
  fetchUnreadNotifications: {
    file: 'notifications',
    fn: 'fetchUnreadNotificationsServerFn',
  },
  markNotificationRead: {
    file: 'notifications',
    fn: 'markNotificationReadServerFn',
  },
  markAllNotificationsRead: {
    file: 'notifications',
    fn: 'markAllNotificationsReadServerFn',
  },
  submitSupportTicket: { file: 'support', fn: 'submitSupportTicketServerFn' },
  updateProfile: { file: 'users', fn: 'updateProfileServerFn' },
  deactivateAccount: { file: 'users', fn: 'deactivateAccountServerFn' },
  deleteAccount: { file: 'users', fn: 'deleteAccountServerFn' },
  getSellerQuotes: { file: 'quotes', fn: 'getSellerQuotesServerFn' },
  fetchSellerStats: { file: 'quotes', fn: 'fetchSellerStatsServerFn' },
  createQuote: { file: 'quotes', fn: 'createQuoteServerFn' },
  updateQuote: { file: 'quotes', fn: 'updateQuoteServerFn' },
  getMyCreditBalance: { file: 'credits', fn: 'getMyCreditBalanceServerFn' },
  getActiveCreditPackages: {
    file: 'credits',
    fn: 'getActiveCreditPackagesServerFn',
  },
  requestCredits: { file: 'credits', fn: 'requestCreditsServerFn' },
} as const satisfies Record<string, ServerFnRef>

export type ServerFnKey = keyof typeof SERVER_FNS

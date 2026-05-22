export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  referenceId?: string | null
  linkUrl?: string | null
  metadata?: {
    requestId?: string
    status?: string
    quotesCount?: number
  } | null
  isRead: boolean
  isPriority: boolean
  createdAt: string
}

export type NotificationType =
  | 'FIRST_QUOTE'
  | 'MILESTONE_3_QUOTES'
  | 'ABANDONED_REQUEST'
  | 'QUOTE_STATUS_CHANGE'
  | 'NEW_QUOTE'
  | 'NEW_LEAD'
  | 'DAILY_DIGEST'
  | 'ACCOUNT_APPROVED'
  | 'QUOTE_WON'
  | 'BOTTLENECK_ALERT'
  | 'NEW_SELLER_WAITLIST'
  | 'SPAM_FLAG'
  | 'CREDIT_REQUEST'
  | 'CREDIT_APPROVED'
  | 'CREDIT_REJECTED'
  | 'SYSTEM'

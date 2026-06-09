import type { NavigatorScreenParams } from '@react-navigation/native'
import type { BuyerRequestRow } from '../types/buyer'
import type { OpenRequestRow } from '../types/seller'
import type { ExistingQuoteData } from '../screens/SubmitQuoteScreen'
import type { SessionUser } from '../lib/api-client'

// ── Root stack ────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined
  Loading: { message: string }
  Login: undefined
  Onboarding: {
    user: SessionUser
    onComplete: (status: string) => void
    onLogOut: () => void
  }
  Waitlist: {
    onLogOut: () => void
    onCheckStatus: () => Promise<void>
    checking: boolean
  }
  BuyerTabs: NavigatorScreenParams<BuyerTabParamList>
  SellerTabs: NavigatorScreenParams<SellerTabParamList>
}

// ── Buyer tab param list (each tab is a stack) ───────────────────────────────

export type BuyerTabParamList = {
  BuyerHomeStack: NavigatorScreenParams<BuyerHomeStackParamList>
  BuyerRequestsStack: NavigatorScreenParams<BuyerRequestsStackParamList>
  BuyerNotificationsStack: NavigatorScreenParams<BuyerNotificationsStackParamList>
  BuyerProfileStack: NavigatorScreenParams<BuyerProfileStackParamList>
}

export type BuyerHomeStackParamList = {
  Home: undefined
  RequestDetails: { requestId: string }
  NewRequest: { buyerId: string }
  EditRequest: {
    buyerId: string
    requestId: string
    prefetchedRequest: BuyerRequestRow
  }
}

export type BuyerRequestsStackParamList = {
  MyRequests: undefined
  RequestDetails: { requestId: string }
  EditRequest: {
    buyerId: string
    requestId: string
    prefetchedRequest: BuyerRequestRow
  }
}

export type BuyerNotificationsStackParamList = {
  Notifications: { userRole?: string }
  RequestDetails: { requestId: string }
  EditRequest: {
    buyerId: string
    requestId: string
    prefetchedRequest: BuyerRequestRow
  }
}

export type BuyerProfileStackParamList = {
  Profile: undefined
  EditProfile: undefined
  Help: undefined
}

// ── Seller tab param list ─────────────────────────────────────────────────────

export type SellerTabParamList = {
  SellerHomeStack: NavigatorScreenParams<SellerHomeStackParamList>
  SellerMarketplaceStack: NavigatorScreenParams<SellerMarketplaceStackParamList>
  SellerQuotesStack: NavigatorScreenParams<SellerQuotesStackParamList>
  SellerNotificationsStack: NavigatorScreenParams<SellerNotificationsStackParamList>
  SellerProfileStack: NavigatorScreenParams<SellerProfileStackParamList>
}

export type SellerHomeStackParamList = {
  SellerHome: undefined
  SubmitQuote: {
    request: OpenRequestRow
    existingQuote: ExistingQuoteData | null
    initialTab?: 'details' | 'quotes' | 'offer'
    sellerId: string
  }
  Credits: undefined
}

export type SellerMarketplaceStackParamList = {
  Marketplace: undefined
  SubmitQuote: {
    request: OpenRequestRow
    existingQuote: ExistingQuoteData | null
    initialTab?: 'details' | 'quotes' | 'offer'
    sellerId: string
  }
  Credits: undefined
}

export type SellerQuotesStackParamList = {
  MyQuotes: undefined
  SubmitQuote: {
    request: OpenRequestRow
    existingQuote: ExistingQuoteData | null
    initialTab?: 'details' | 'quotes' | 'offer'
    sellerId: string
  }
  Credits: undefined
}

export type SellerNotificationsStackParamList = {
  Notifications: { userRole?: string }
  RequestDetails: { requestId: string }
}

export type SellerProfileStackParamList = {
  Profile: undefined
  EditProfile: undefined
  Help: undefined
  Credits: undefined
}

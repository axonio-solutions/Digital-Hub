import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { DirectionProvider, directionForLocale } from 'expo-rtl'

import {
  clearAuthToken,
  fetchSession,
  getAuthToken,
} from './src/lib/api-client'
import { queryClient } from './src/lib/query-client'
import { useUserStore } from './src/lib/stores/user-store'
import { RootNavigator } from './src/navigation/RootNavigator'
import {
  cleanupNotificationResponseListener,
  getInitialNotificationResponse,
  initNotificationHandler,
  registerBackgroundNotificationTask,
  registerPushToken,
  setupNotificationForegroundListener,
  setupNotificationResponseListener,
  unregisterBackgroundNotificationTask,
} from './src/lib/push-notifications'
import { LanguageSelectScreen } from './src/screens/LanguageSelectScreen'
import i18next, { initI18n } from './src/i18n'
import type { NotificationData } from './src/lib/push-notifications'
import type { RootStackParamList } from './src/navigation/types'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={errorStyles.container}>
      <StatusBar style="dark" />
      <Text style={errorStyles.title}>Something went wrong</Text>
      <Text style={errorStyles.message}>{error.message}</Text>
    </View>
  )
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#EFF6FF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
})

function LoadingScreen({ message }: { message: string }) {
  const pulse = useRef(new Animated.Value(1)).current
  const ringOpacity = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.45,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.5,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse, ringOpacity])

  return (
    <View style={loadingStyles.container}>
      <StatusBar style="dark" />
      <View style={loadingStyles.center}>
        <View style={loadingStyles.brandMark}>
          <Animated.View
            style={[
              loadingStyles.pulseRing,
              { transform: [{ scale: pulse }], opacity: ringOpacity },
            ]}
          />
          <View style={loadingStyles.dot} />
        </View>
        <Text style={loadingStyles.brand}>mlila</Text>
        <Text style={loadingStyles.message}>{message}</Text>
      </View>
    </View>
  )
}

function AppContent() {
  const user = useUserStore((s) => s.user)
  const authState = useUserStore((s) => s.authState)
  const hasLanguage = useUserStore((s) => s.hasLanguage)
  const checkingStatus = useUserStore((s) => s.checkingStatus)
  const setAuthState = useUserStore((s) => s.setAuthState)
  const setUser = useUserStore((s) => s.setUser)
  const setCheckingStatus = useUserStore((s) => s.setCheckingStatus)
  const setHasLanguage = useUserStore((s) => s.setHasLanguage)
  const logout = useUserStore((s) => s.logout)
  const [i18nReady, setI18nReady] = useState(false)
  const [showLangSelect, setShowLangSelect] = useState(false)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')

  useEffect(() => {
    initI18n()
      .then((saved) => {
        setI18nReady(true)
        if (saved) setHasLanguage(true)
        setShowLangSelect(saved === null)
        setDirection(directionForLocale(i18next.language))
      })
      .catch(() => {
        setI18nReady(true)
      })
  }, [])

  useEffect(() => {
    const handler = (lng: string) => setDirection(directionForLocale(lng))
    i18next.on('languageChanged', handler)
    return () => {
      i18next.off('languageChanged', handler)
    }
  }, [])

  useEffect(() => {
    initNotificationHandler()
    registerBackgroundNotificationTask()
    return () => {
      unregisterBackgroundNotificationTask()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getAuthToken()
      .then((token) => {
        if (cancelled) return
        if (token) {
          setAuthState('session-loading')
          return fetchSession().then((sessionUser) => {
            if (cancelled) return
            if (!sessionUser) {
              clearAuthToken()
              setAuthState('signed-out')
              return
            }
            setUser(sessionUser)
            setAuthState('ready')
          })
        } else {
          setAuthState('signed-out')
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState('signed-out')
      })
    return () => {
      cancelled = true
    }
  }, [setAuthState, setUser])

  const handleOnboardingComplete = useCallback(
    (role: string, accountStatus: string) => {
      const currentUser = useUserStore.getState().user
      if (currentUser) {
        setUser({
          ...currentUser,
          role: role as 'buyer' | 'seller',
          account_status: accountStatus,
        })
      }
    },
    [setUser],
  )

  const handleCheckStatus = useCallback(async () => {
    setCheckingStatus(true)
    try {
      const sessionUser = await fetchSession()
      if (!sessionUser) {
        await clearAuthToken()
        setUser(null)
        setAuthState('signed-out')
        return
      }
      setUser(sessionUser)
      if (
        sessionUser.account_status === 'active' ||
        sessionUser.account_status === 'waitlisted'
      ) {
        setAuthState('ready')
      }
    } catch {
      await clearAuthToken()
      setUser(null)
      setAuthState('signed-out')
    } finally {
      setCheckingStatus(false)
    }
  }, [setAuthState, setUser, setCheckingStatus])

  useEffect(() => {
    if (
      authState === 'ready' &&
      (user?.role === 'buyer' || user?.role === 'seller')
    ) {
      registerPushToken(user)
    }
  }, [authState, user])

  const pendingNavRef = useRef<Array<() => void>>([])

  const enqueueOrNavigate = useCallback(
    (notifData: NotificationData) => {
      const { requestId, type, action } = notifData
      const doNav = () => {
        if (!navigationRef.isReady() || !requestId) return false

        // Read role at execution time — the closure runs either immediately or
        // from the onReady queue, by which point auth must be settled.
        const currentUser = useUserStore.getState().user
        if (!currentUser?.role) return false

        if (currentUser.role === 'seller') {
          const isQuoteAccepted =
            type === 'QUOTE_STATUS_CHANGE' &&
            (action === 'accepted' || action === 'rejected')
          const isOrderChange =
            type === 'QUOTE_STATUS_CHANGE' && action === 'order_change'

          if (isQuoteAccepted) {
            navigationRef.navigate('SellerTabs', {
              screen: 'SellerQuotesStack',
              params: {
                screen: 'MyQuotes',
                initial: false,
              },
            })
          } else if (isOrderChange) {
            navigationRef.navigate('SellerTabs', {
              screen: 'SellerNotificationsStack',
              params: {
                screen: 'SubmitQuote',
                params: {
                  requestId,
                  existingQuote: null,
                  sellerId: currentUser.id,
                  initialTab: 'offer',
                },
                initial: false,
              },
            })
          } else {
            navigationRef.navigate('SellerTabs', {
              screen: 'SellerNotificationsStack',
              params: {
                screen: 'RequestDetails',
                params: { requestId },
                initial: false,
              },
            })
          }
        } else {
          navigationRef.navigate('BuyerTabs', {
            screen: 'BuyerNotificationsStack',
            params: {
              screen: 'RequestDetails',
              params: { requestId },
              initial: false,
            },
          })
        }
        return true
      }
      if (!doNav()) {
        pendingNavRef.current.push(doNav)
      }
    },
    [],
  )

  useEffect(() => {
    setupNotificationResponseListener(enqueueOrNavigate)
    setupNotificationForegroundListener(() => {
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
    })
    getInitialNotificationResponse().then((response) => {
      if (response) {
        enqueueOrNavigate(response.data)
      }
    })
    return () => {
      cleanupNotificationResponseListener()
      pendingNavRef.current = []
    }
    // enqueueOrNavigate is stable (no deps); queryClient is module-level constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lastResetRef = useRef<string | null>(null)

  useEffect(() => {
    if (!navigationRef.isReady()) return
    if (authState === 'checking' || authState === 'session-loading') {
      lastResetRef.current = null
      return
    }

    const accountStatus = user?.account_status

    let target: string | null = null
    let params: Record<string, any> | undefined

    if (authState === 'signed-out') {
      target = hasLanguage ? 'Login' : 'Splash'
    } else if (accountStatus === 'new' || !accountStatus) {
      target = 'Onboarding'
      params = {
        user: user!,
        onComplete: handleOnboardingComplete,
        onLogOut: logout,
      }
    } else if (accountStatus === 'waitlisted') {
      target = 'Waitlist'
      params = {
        onLogOut: logout,
        onCheckStatus: handleCheckStatus,
        checking: checkingStatus,
      }
    } else if (user?.role === 'buyer') {
      target = 'BuyerTabs'
      params = { screen: 'BuyerHomeStack', params: { screen: 'Home' } }
    } else if (user?.role === 'seller') {
      target = 'SellerTabs'
      params = { screen: 'SellerHomeStack', params: { screen: 'SellerHome' } }
    }

    if (target && target !== lastResetRef.current) {
      lastResetRef.current = target
      navigationRef.reset({ index: 0, routes: [{ name: target, params }] })
    }
  }, [authState, user?.account_status, user?.role, hasLanguage])

  return (
    <DirectionProvider dir={direction}>
      {!i18nReady ? (
        <LoadingScreen message="Loading…" />
      ) : showLangSelect ? (
        <LanguageSelectScreen onComplete={() => {
          setAuthState('signed-out')
          setShowLangSelect(false)
        }} />
      ) : authState === 'checking' || authState === 'session-loading' ? (
        <LoadingScreen
          message={
            authState === 'session-loading' ? 'Signing you in…' : 'Loading…'
          }
        />
      ) : (
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            const queue = pendingNavRef.current
            pendingNavRef.current = []
            for (const fn of queue) fn()
          }}
        >
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      )}
    </DirectionProvider>
  )
}

export default function App() {
  const [crashError, setCrashError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof ErrorUtils !== 'undefined') {
      const prev = ErrorUtils.getGlobalHandler()
      ErrorUtils.setGlobalHandler((error: Error) => {
        setCrashError(error?.message ?? String(error))
        prev?.(error, false)
      })
    }
  }, [])

  if (crashError) {
    return (
      <SafeAreaProvider>
        <ErrorFallback error={new Error(crashError)} />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingScreen message="Loading…" />}>
          <AppContent />
        </Suspense>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const loadingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF6FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brandMark: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2563EB' },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  message: { fontSize: 15, color: '#64748B', fontWeight: '500' },
})

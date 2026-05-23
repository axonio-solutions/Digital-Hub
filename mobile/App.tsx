import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import {
  clearAuthToken,
  fetchSession,
  getAuthToken,
} from './src/lib/api-client'
import { LoginScreen } from './src/screens/LoginScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import SplashScreen from './src/screens/SplashScreen'
import { WaitlistScreen } from './src/screens/WaitlistScreen'
import { BuyerScreen } from './src/screens/BuyerScreen'
import { SellerScreen } from './src/screens/SellerScreen'
import {
  cleanupNotificationResponseListener,
  registerPushToken,
  setupNotificationResponseListener,
} from './src/lib/push-notifications'
import type { SessionUser } from './src/lib/api-client'

type AuthState = 'checking' | 'signed-out' | 'session-loading' | 'ready'

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
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const pendingRequestRef = useRef<string | null>(null)

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
        if (cancelled) return
        setAuthState('signed-out')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSignedIn = useCallback(() => {
    setAuthState('session-loading')
    fetchSession()
      .then((sessionUser) => {
        if (!sessionUser) {
          console.warn('⚠️ fetchSession returned null — clearing token')
          clearAuthToken()
          setAuthState('signed-out')
          return
        }
        setUser(sessionUser)
        setAuthState('ready')
      })
      .catch((err) => {
        console.error('❌ fetchSession error:', err?.message ?? err)
        setAuthState('signed-out')
      })
  }, [])

  const handleLogOut = useCallback(async () => {
    await clearAuthToken()
    setUser(null)
    setAuthState('signed-out')
  }, [])

  const handleOnboardingComplete = useCallback((accountStatus: string) => {
    if (accountStatus === 'waitlisted') {
      setUser((prev) =>
        prev ? { ...prev, account_status: 'waitlisted' } : prev,
      )
    } else {
      setUser((prev) => (prev ? { ...prev, account_status: 'active' } : prev))
    }
  }, [])

  useEffect(() => {
    if (
      authState === 'ready' &&
      (user?.role === 'buyer' || user?.role === 'seller')
    ) {
      registerPushToken(user)
    }
  }, [authState, user])

  useEffect(() => {
    const onNavigateToRequest = (requestId: string) => {
      pendingRequestRef.current = requestId
    }
    setupNotificationResponseListener(onNavigateToRequest)
    return () => {
      cleanupNotificationResponseListener()
    }
  }, [])

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
  }, [])

  if (authState === 'checking' || authState === 'session-loading') {
    return (
      <LoadingScreen
        message={
          authState === 'session-loading' ? 'Signing you in…' : 'Loading…'
        }
      />
    )
  }

  if (authState === 'signed-out') {
    if (showSplash) {
      return (
        <>
          <SplashScreen onComplete={() => setShowSplash(false)} />
          <StatusBar style="dark" />
        </>
      )
    }
    return (
      <>
        <LoginScreen onSignedIn={handleSignedIn} />
        <StatusBar style="auto" />
      </>
    )
  }

  // authState === 'ready'
  const accountStatus = user?.account_status

  if (accountStatus === 'new' || !accountStatus) {
    return (
      <>
        <OnboardingScreen
          user={user!}
          onComplete={handleOnboardingComplete}
          onLogOut={handleLogOut}
        />
        <StatusBar style="auto" />
      </>
    )
  }

  if (accountStatus === 'waitlisted') {
    return (
      <>
        <WaitlistScreen
          onLogOut={handleLogOut}
          onCheckStatus={handleCheckStatus}
          checking={checkingStatus}
        />
        <StatusBar style="auto" />
      </>
    )
  }

  if (user?.role === 'buyer') {
    return (
      <>
        <BuyerScreen
          user={user}
          onLogOut={handleLogOut}
          onUserUpdate={setUser}
          pendingRequestId={pendingRequestRef.current}
          onPendingRequestConsumed={() => {
            pendingRequestRef.current = null
          }}
        />
        <StatusBar style="auto" />
      </>
    )
  }

  if (user?.role === 'seller') {
    return (
      <>
        <SellerScreen
          user={user}
          onLogOut={handleLogOut}
          onUserUpdate={setUser}
          pendingRequestId={pendingRequestRef.current}
          onPendingRequestConsumed={() => {
            pendingRequestRef.current = null
          }}
        />
        <StatusBar style="auto" />
      </>
    )
  }

  return (
    <View style={styles.fallback}>
      <Text style={{ color: '#666', fontSize: 16 }}>
        Your account is active. Mobile dashboard for your role is coming soon.
      </Text>
      <StatusBar style="auto" />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
})

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
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
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
})

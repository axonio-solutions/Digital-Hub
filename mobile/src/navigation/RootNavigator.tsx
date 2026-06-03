import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useRoute } from '@react-navigation/native'

import SplashScreen from '../screens/SplashScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { WaitlistScreen } from '../screens/WaitlistScreen'
import { BuyerNavigator } from './BuyerNavigator'
import { SellerNavigator } from './SellerNavigator'
import { useUserStore } from '../lib/stores/user-store'
import type { RootStackParamList } from './types'

const Root = createNativeStackNavigator<RootStackParamList>()

function OnboardingWrapper() {
  const route = useRoute<any>()
  if (!route?.params?.user) return null
  return (
    <OnboardingScreen
      user={route.params.user}
      onComplete={route.params.onComplete}
      onLogOut={route.params.onLogOut}
    />
  )
}

function WaitlistWrapper() {
  const route = useRoute<any>()
  if (!route?.params) return null
  return (
    <WaitlistScreen
      onLogOut={route.params.onLogOut}
      onCheckStatus={route.params.onCheckStatus}
      checking={route.params.checking}
    />
  )
}

export function RootNavigator() {
  const authState = useUserStore((s) => s.authState)
  const user = useUserStore((s) => s.user)

  let initialRoute: keyof RootStackParamList = 'Splash'
  if (authState === 'ready') {
    const status = user?.account_status
    if (status === 'new' || !status) {
      initialRoute = 'Onboarding'
    } else if (status === 'waitlisted') {
      initialRoute = 'Waitlist'
    } else if (user?.role === 'buyer') {
      initialRoute = 'BuyerTabs'
    } else if (user?.role === 'seller') {
      initialRoute = 'SellerTabs'
    }
  } else if (authState === 'signed-out') {
    initialRoute = 'Splash'
  }

  return (
    <Root.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Root.Screen name="Splash" component={SplashScreen} />
      <Root.Screen name="Login" component={LoginScreen} />
      <Root.Screen name="Onboarding" component={OnboardingWrapper} />
      <Root.Screen name="Waitlist" component={WaitlistWrapper} />
      <Root.Screen name="BuyerTabs" component={BuyerNavigator} />
      <Root.Screen name="SellerTabs" component={SellerNavigator} />
    </Root.Navigator>
  )
}

# Mobile Codebase — Refactoring Plan

Based on codebase analysis + 2025–2026 React Native industry best practices (State of React Native 2025, TanStack Query, FlashList, React Hook Form, Zustand, Reanimated).

---

## What We Have vs. What the Industry Uses

| Concern               | Current (mobile)                                   | Industry Standard 2025–2026                             |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| **Server state**      | Manual `useState` + `useEffect` + `useFocusEffect` | **TanStack Query** (caching, dedup, retries, mutations) |
| **Client state**      | Prop drilling through navigation params            | **Zustand** (no providers, 1KB, TS-first)               |
| **Form validation**   | Manual regex in `LoginScreen`                      | **React Hook Form** + **Zod**                           |
| **List rendering**    | `FlatList`                                         | **FlashList** (5× faster, 82% CPU reduction)            |
| **Images**            | `<Image source={{ uri }} />`                       | **expo-image** (caching, placeholders, auto-resize)     |
| **Animations**        | `Animated` API (JS thread)                         | **Reanimated 4** (UI thread worklets)                   |
| **Local storage**     | `expo-secure-store` (token only)                   | **MMKV** (10–30× faster than AsyncStorage)              |
| **Architecture**      | `newArchEnabled: false`                            | **New Architecture** (Fabric + TurboModules)            |
| **Shared components** | Duplicated inline (skeleton, avatar, empty state)  | Extracted shared components                             |

---

## Phase 1 — Foundation ✅ DONE

### 1.1 ✅ Enable New Architecture

**File:** `app.json`
**Change:** `"newArchEnabled": false` → `true`

### 1.2 ✅ React Compiler (Auto-Memoization)

**File:** `app.json`
**Add:** `"experiments": { "reactCompiler": true }`

### 1.3 ✅ Decision: Stay with React Navigation

Navigation tree stays as-is. `as never` casts will be cleaned up in Phase 5.

### 1.4 ✅ Install Dependencies

Installed: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@react-native-community/netinfo`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `@shopify/flash-list`, `react-native-reanimated`, `react-native-mmkv`

### 1.5 ✅ Set Up Core Providers

**New files created:**

- `src/lib/query-client.ts` — QueryClient with NetInfo `onlineManager` + AppState `focusManager`
- `src/lib/stores/user-store.ts` — Zustand store for user/auth state/checkingStatus/logout
- `src/lib/stores/ui-store.ts` — Zustand store for unreadCount

**Modified:**

- `App.tsx` — Wrapped with `QueryClientProvider`; reads user/authState/checkingStatus from `useUserStore`; all callbacks use store actions

---

## Phase 2 — State & Data ✅ DONE

### 2.1 ✅ TanStack Query (Replaces All Manual Data Fetching)

All screens migrated from `useState`/`useEffect`/`useFocusEffect` boilerplate to `useQuery`/`useMutation`:

| File                          | Migration                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `BuyerDashboardScreen.tsx`    | `useQuery(buyerRequestsQueryOptions)`                                                  |
| `SellerDashboardScreen.tsx`   | `useQuery(sellerDashboardQueryOptions)` + `creditBalanceQueryOptions`                  |
| `SellerMarketplaceScreen.tsx` | `useQuery(taxonomyQueryOptions)` + `creditBalanceQueryOptions`; manual pagination kept |
| `RequestsScreen.tsx`          | `useQuery(buyerRequestsQueryOptions)`                                                  |
| `SellerQuotesScreen.tsx`      | `useQuery(sellerQuotesQueryOptions)`; optimistic cache via `setQueryData`              |
| `NotificationScreen.tsx`      | `useQuery(unreadNotificationsQueryOptions)` with `refetchInterval: 30000`              |
| `RequestDetailScreen.tsx`     | `useQuery(buyerRequestDetailQueryOptions)`; handlers use `invalidateQueries`           |
| `CreateRequestScreen.tsx`     | `useQuery(taxonomyQueryOptions)`; remaining mutation handlers kept as-is               |

### 2.2 ✅ Query Options Factories Created

- `src/features/buyer/queries/requests.ts` — `buyerRequestsQueryOptions`, `buyerRequestDetailQueryOptions`, `anonymousQuotesQueryOptions`
- `src/features/seller/queries/dashboard.ts` — `sellerDashboardQueryOptions`, `creditBalanceQueryOptions`
- `src/features/seller/queries/marketplace.ts` — `openRequestsQueryOptions`
- `src/features/seller/queries/quotes.ts` — `sellerQuotesQueryOptions`
- `src/features/notifications/queries/notifications.ts` — `unreadNotificationsQueryOptions` (30s `refetchInterval`)
- `src/features/taxonomy/queries/taxonomy.ts` — `taxonomyQueryOptions` (10min `staleTime`)

### 2.3 ✅ Prop Drilling Removed (Zustand replaces nav-param-prop-drilling)

Removed `userProp ?? route.params?.user` pattern from all 7 screens. Screens now read directly from `useUserStore`:

| Screen                        | What changed                                                    |
| ----------------------------- | --------------------------------------------------------------- |
| `BuyerDashboardScreen.tsx`    | `const user = useUserStore((s) => s.user)!`                     |
| `SellerDashboardScreen.tsx`   | `const user = useUserStore((s) => s.user)!`                     |
| `SellerMarketplaceScreen.tsx` | `const user = useUserStore((s) => s.user)`                      |
| `SellerQuotesScreen.tsx`      | `const user = useUserStore((s) => s.user)`                      |
| `ProfileScreen.tsx`           | `const user = useUserStore((s) => s.user)`, `logout`, `setUser` |
| `EditProfileScreen.tsx`       | `const user = useUserStore((s) => s.user)!`, `setUser`          |
| `NotificationScreen.tsx`      | `const role = useUserStore((s) => s.user?.role ?? 'buyer')`     |

**Navigators simplified:**

- `BuyerNavigator` — no longer accepts props; reads `user` from store for `handleCreatePress`; stack wrappers no longer unpack `route.params`
- `SellerNavigator` — same pattern
- `RootNavigator` — removed `BuyerTabsWrapper`/`SellerTabsWrapper`; uses `BuyerNavigator`/`SellerNavigator` directly as screen components
- `App.tsx` — simplified navigate calls (no more `user`/`onLogOut`/`onUserUpdate` at top level)

**Navigation types cleaned up:**

- Removed `SharedTabParams` type entirely
- All screen param types that previously required `user`, `onLogOut`, or `onUserUpdate` changed to `undefined`

### 2.3 ✅ Offline Mutation Queue

TanStack Query's `onlineManager` + `NetInfo` automatically pauses queries when offline and refetches on reconnect. For write operations (mutations), add an offline queue:

```ts
// useMutation already handles this when onlineManager is wired:
const mutation = useMutation({
  mutationFn: createQuoteFn,
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
})
```

TanStack Query serializes failed mutations and retries them when the network returns — no additional queue library needed. The `onlineManager` setup in Phase 1 enables this automatically.

---

## Phase 3 — Forms & Validation ✅ DONE

### 3.1 ✅ React Hook Form + Zod for All Screens

All manual `useState`/`useEffect` form state replaced with `useForm` + `zodResolver`:

| File                                       | Migration                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LoginScreen.tsx`                          | Regex `validate()` → Zod `signInSchema`/`signUpSchema` with `useForm`. Mode toggle resets form with `reset()`. Banner errors use `setBannerError`.                                                         |
| `SupportScreen.tsx`                        | `useState` + `validate()` → `useForm` + `supportSchema`. Category radio buttons use `setValue`. Textarea uses `Controller`.                                                                                |
| `SellerQuoteForm.tsx`                      | Zod `safeParse()` → `useForm` + `zodResolver(quoteSchema)`. Price/condition/warranty use `Controller`.                                                                                                     |
| `CreateRequestScreen.tsx` + 6 wizard steps | 14 `useState` calls → `useForm` + `requestSchema` + `FormProvider`. Each step uses `useFormContext()`. Step validation uses `form.trigger()`.                                                              |
| `EditProfileScreen.tsx`                    | `useState` for 9 profile fields → `useForm` + `profileSchema`. Local `Field` component replaced with `renderLocalField()` using `Controller`. Password change and danger zone kept as-is (separate flows). |
| `OnboardingScreen.tsx`                     | `FormData` object + `updateForm` → `useForm` + `onboardingSchema`. Role cards use `setValue`. Contact/location fields use `Controller`. Step validation uses `form.trigger()`.                             |

### 3.2 ✅ `Field.tsx` Updated with `ControlledField`

Added `ControlledField<T>` generic component — wraps React Hook Form's `Controller` around the existing `Field` for one-liner form inputs:

```tsx
<ControlledField<LoginForm>
  control={form.control}
  name="email"
  label="Email"
  placeholder="you@example.com"
/>
```

Also exported as a named export alongside the existing `Field` component.

---

## Phase 4 — Performance ✅ DONE

### 4.1 ✅ FlashList (Replace FlatList)

All 7 `FlatList` instances replaced with `@shopify/flash-list`:

- `BuyerDashboardScreen`, `SellerMarketplaceScreen`, `RequestsScreen`, `SellerQuotesScreen`, `SplashScreen`, `SpecialtiesSheet`, `WilayaPicker`
- Removed FlatList-only props (`maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`, `initialNumToRender`)
- Updated `SplashScreen` ref type from `useRef<FlatList>` to `useRef<FlashListRef<any>>`

### 4.2 ✅ expo-image (Replace `<Image>`)

Installed `expo-image` and migrated all 22 `<Image source={{ uri }}>` usages across 15 files:

- Added `contentFit="cover"` (replaces `resizeMode`)
- All screens and wizard steps updated
- Disk + memory caching enabled automatically

### 4.3 ✅ Reanimated 4 (Skeleton Shimmers + Press Scales)

Created `babel.config.js` with `react-native-reanimated/plugin` and migrated:

- **Skeleton shimmer** in `BuyerDashboardScreen` (`SkeletonCard`), `SellerDashboardScreen` (`SkeletonState`), `RequestsScreen` (`SkeletonCard`) — `Animated.loop`/`Animated.sequence` → `withRepeat`/`withSequence`/`withTiming` on UI thread
- **Card press scale** in `BuyerDashboardScreen` + `RequestsScreen` (`RequestCard`) — `Animated.spring` → `withSpring` worklet
- **Entry animations** (fade/slide) in `BuyerDashboardScreen` + `RequestsScreen` — `Animated.timing` → `withTiming` + `useAnimatedStyle`
- All 3 files now use `import Animated from 'react-native-reanimated'` — animations run on UI thread, not JS thread >
  <Animated.View style={animatedStyle}>{children}</Animated.View>
  </Pressable>
  )
  }

````

**Bonus:** ✅ Extracted `AnimatedPressable` as a shared component (`src/components/AnimatedPressable.tsx`) — eliminates duplicated press-scale patterns across BuyerDashboardScreen, RequestsScreen, Button, LoginScreen, and ProfileScreen. Uses Reanimated `useSharedValue`/`withSpring` with configurable `scaleTo` and `springConfig` props.

### 4.4 ✅ expo-file-system for Cache Persistence

MMKV requires `npx expo prebuild` which crashes with `newArchEnabled: true`. Used `expo-file-system` instead — Expo-managed-compatible, no native build needed.

Installed `@tanstack/query-persist-client-core` and `expo-file-system`.

**New file:** `src/lib/storage.ts` — KV adapter wrapping `expo-file-system` (`getItem`/`setItem`/`removeItem` with `JSON.parse`/`stringify`).

**Modified:** `src/lib/query-client.ts` — wired `persistQueryClient` with `createPersister` using the file-system adapter, 5 min `maxAge`.

### 4.5 ✅ Storage Split: SecureStore vs. expo-file-system

| Concern | Use | Reason |
|---|---|---|
| **Auth tokens** | `expo-secure-store` (keep as-is) | iOS Keychain / Android Keystore — hardware-backed encryption |
| **TanStack Query cache** | expo-file-system | Works in Expo Go, no prebuild needed |
| **Zustand persist** | expo-file-system via `persist` middleware | Zustand's `persist` middleware with custom `storage` |
| **General app data** | expo-file-system | Quick JSON file storage |

**Never** put auth tokens in plain filesystem. Keep SecureStore for secrets, expo-file-system for everything else.

```ts
// SecureStore — tokens (already done)
import * as SecureStore from 'expo-secure-store'
await SecureStore.setItemAsync('auth_session_token', token)

// expo-file-system — everything else
import { storage } from '../lib/storage'
await storage.setItem('user-preferences', JSON.stringify(prefs))
````

---

## Phase 5 — Shared Components & Polish ✅ DONE

### 5.1 ✅ Extract Shared Components (AnimatedPressable done)

| Component             | Current state                                                                                                                                                                                                               | Replacements |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Skeleton**          | ✅ Extracted — `components/Skeleton.tsx` (`SkeletonBox` + `SkeletonCard`). `SkeletonCard` replaces inline in BuyerDashboardScreen & RequestsScreen. `SkeletonBox` replaces inline animation in SellerDashboardScreen.       |
| **EmptyState**        | ✅ Extracted — `components/EmptyState.tsx`. Replaces inline in BuyerDashboardScreen, SellerDashboardScreen, and SellerMarketplaceScreen. Accepts `icon` (ReactNode), `title`, `description`, `action` (ReactNode), `style`. |
| **ErrorState**        | ✅ Extracted — `components/ErrorState.tsx`. Replaces inline in SellerDashboardScreen. Accepts `message` and `onRetry`.                                                                                                      |
| **UserAvatar**        | ✅ Extracted — `components/UserAvatar.tsx`. Replaces inline in BuyerDashboardScreen (44px + online dot) and SellerDashboardScreen (56px). Accepts `image`, `name`, `initials`, `size`, `showOnlineDot`.                     |
| **AnimatedPressable** | ✅ Extracted — `components/AnimatedPressable.tsx` (Reanimated `withSpring`)                                                                                                                                                 |

### 5.2 ✅ Navigation Types Cleanup

All `as any` casts removed:

- BuyerNavigator & SellerNavigator — `routeName as any` → `routeName as keyof TabParamList`
- RequestDetailScreen — `request as any` removed (no cast needed), `w as any` → typed as `number | \`${number}%\``
- App.tsx — inlined `if/else` to avoid union param type, removed `as any` from all `navigationRef.navigate` calls

### 5.3 ✅ Theme Type Safety

`SellerDashboardScreen.tsx` typed 8 sub-components with `t: any`. Fixed to `t: Theme` using `type { Theme }` import from `../theme/tokens`.

### 5.4 ✅ StyleSheet Consistency

All screens migrated to `makeStyles(t: Theme)` pattern: **15 screens** converted from global `const styles = StyleSheet.create({})` to dynamic theme-aware functions. Files with brand-specific hardcoded colors (SplashScreen `C.blue`/`C.green`/`C.bg`, SellerBillingScreen `C.amber`/`C.navy`, and status color `C` constants in ProfileScreen/SellerDashboardScreen/SellerQuotesScreen) retained their intentional hardcoded values — only `t.xxx` theme references were moved into makeStyles.

### 5.5 ✅ API Client Cleanup

Removed redundant `headers['Cookie']` in `api-client.ts:46` — `Authorization: Bearer` alone is sufficient for React Native mobile.

---

## Recommended Implementation Order (Updated)

```
Phase 1 — Foundation ✅ Done
├── Enable New Architecture (app.json) ✅
├── Enable React Compiler (experiments.reactCompiler) ✅
├── Evaluate Expo Router migration vs. fixing current nav ✅
├── Install all dependencies ✅
├── Create QueryClient + NetInfo + AppState setup ✅
├── Create Zustand user store ✅
└── Wire QueryClientProvider + Zustand in App.tsx ✅

Phase 2 — State & Data ✅ Done
├── Migrate all data fetching to TanStack Query ✅
├── Migrate auth/user to Zustand (remove nav-param-prop-drilling) ✅
├── Add mutations for quotes, requests, etc. ✅
├── Replace notification polling with useQuery(refetchInterval) ✅
└── Remove handleSignedIn/handleLogOut callbacks from nav params ✅ (stored in Zustand)

Phase 3 — Forms ✅ Done
├── React Hook Form + Zod schemas for LoginScreen ✅
├── Refactor CreateRequestScreen wizard (FormProvider) ✅
├── Refactor EditProfileScreen, SupportScreen, OnboardingScreen ✅
├── Refactor SellerQuoteForm to useForm + zodResolver ✅
└── Update Field.tsx with ControlledField generic component ✅

Phase 4 — Performance ✅ Done
├── FlatList → FlashList (6 files) ✅
├── <Image> → expo-image (20+ usages) ✅
├── Animated API → Reanimated 4 (6 animation patterns) ✅
├── Extract AnimatedPressable shared component ✅
├── Cache persistence (expo-file-system) ✅
└── Storage split (SecureStore for tokens, file-system for rest) ✅

Phase 5 — Polish ✅ Done
├── Extract shared components (Skeleton, EmptyState, ErrorState, Avatar) ✅
├── Navigation types cleanup (remove as never) ✅
├── Theme type safety (fix any → Theme) ✅
├── StyleSheet consistency pass ✅ (15 screens converted)
├── API client cleanup ✅
└── Offline mutation queue verification ✅
```

**Total estimated effort: ~9 days**

---

## What You Gained — Summary of Benefits

### Phase 1 — Foundation

- **New Architecture (Fabric + TurboModules):** Faster native rendering, less JS bridge overhead. Lists, text inputs, and scroll views render on the UI thread.
- **React Compiler:** Automatic memoization. Components skip re-rendering when props/state haven't changed — zero manual `React.memo`/`useMemo` needed.

### Phase 2 — State & Data

- **TanStack Query (all 8 screens):** Automatic caching, deduplication, background refetch on focus, retry on failure, and optimistic updates. Loading states come for free. No more manual `useFocusEffect` + `useState` + `useEffect` boilerplate.
- **Zustand (prop drilling eliminated):** `user`, `onLogOut`, `onUserUpdate` no longer passed through navigation params. Add a screen? Just `const user = useUserStore((s) => s.user)` — no wiring required.

### Phase 3 — Forms

- **React Hook Form + Zod (6 screens):** Validation rules are declarative schemas, errors render automatically. The 14 `useState` calls in the request wizard became a single `useForm`. `Field.tsx` now exports `ControlledField<T>` — one-liner form inputs with full type safety.

### Phase 4 — Performance

- **FlashList (7 instances):** Estimated ~80% CPU reduction on long lists. Recycling + batched rendering means 500+ items scroll smoothly.
- **expo-image (22 usages):** Disk + memory caching out of the box. Images don't flicker on re-mount and load instantly from cache on subsequent visits.
- **Reanimated 4 (6 animation patterns):** Animations run on the UI thread, not the JS thread. Skeleton shimmers, press scales, and entry animations stay smooth even during heavy renders.
- **Cache persistence (expo-file-system):** TanStack Query cache survives app restarts. No redundant API calls on cold start. Zustand stores (user, UI) persist across sessions.
- **Storage split:** Auth tokens stay in `expo-secure-store` (iOS Keychain / Android Keystore — hardware-backed encryption). Everything else uses the filesystem. No plain-text secrets.

### Phase 5 — Polish

- **Shared components (5 extracted):** `Skeleton`, `EmptyState`, `ErrorState`, `UserAvatar`, `AnimatedPressable` replace duplicated inline code across 11 files. Change the shimmer animation in one place.
- **StyleSheet consistency (15 screens → `makeStyles(t)`):** All screens now read from a single `Theme` type. Swap the color palette once and every screen follows — dark mode becomes a trivial change.
- **Type-safe navigation (0 `as any` casts):** TypeScript catches broken navigation calls at compile time instead of throwing undefined-is-not-an-object at runtime.
- **API client cleanup:** Removed redundant `Cookie` header — `Authorization: Bearer` alone is standard for mobile.

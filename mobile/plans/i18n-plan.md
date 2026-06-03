# i18n Plan — Mobile App

## Status: 🟢 Complete — PagerView + PanResponder RTL carousel applied

---

## What was built

Full i18n support (EN / FR / AR) for the React Native app, plus a language-selection first screen.

---

## Phases

### Phase 1 — Dependencies & i18n Config — ✅ Done

- Installed `i18next` + `react-i18next`
- Created `mobile/src/i18n/index.ts` — i18next initialization with language detection from `storage.ts`, fallback `en`
- Created locale JSON files:
  - `mobile/src/i18n/locales/en.json`
  - `mobile/src/i18n/locales/fr.json`
  - `mobile/src/i18n/locales/ar.json`
- RTL: `I18nManager.forceRTL()` for Arabic (no reload prompt)

### Phase 2 — Language Selection Screen — ✅ Done

- Created `mobile/src/screens/LanguageSelectScreen.tsx`
  - Full-screen with mlila branding
  - 3 language cards: English, Français, العربية
  - Persists choice to `storage`, calls `i18next.changeLanguage()`
- Updated `App.tsx` — checks saved language on mount, renders LanguageSelectScreen outside NavigationContainer if none set
- Updated `navigation/types.ts` — added `LanguageSelect` to param list
- Added language switcher globe button to `SplashScreen.tsx` with bottom sheet picker

### Phase 3 — Translate All Screens — ✅ Done

All hardcoded strings replaced with `t('key')` calls across 25+ screen files, components, and Zod schemas:

| File                     | Status |
| ------------------------ | ------ |
| SplashScreen.tsx         | ✅     |
| LoginScreen.tsx          | ✅     |
| OnboardingScreen.tsx     | ✅     |
| HomeScreen.tsx           | ✅     |
| SellerHomeScreen.tsx     | ✅     |
| MarketplaceScreen.tsx    | ✅     |
| NewRequestScreen.tsx     | ✅     |
| BrandStep.tsx            | ✅     |
| CategoryStep.tsx         | ✅     |
| PartDetailsStep.tsx      | ✅     |
| PhotosStep.tsx           | ✅     |
| ReviewStep.tsx           | ✅     |
| VehicleInfoStep.tsx      | ✅     |
| MyRequestsScreen.tsx     | ✅     |
| RequestDetailsScreen.tsx | ✅     |
| MyQuotesScreen.tsx       | ✅     |
| SubmitQuoteScreen.tsx    | ✅     |
| SellerQuoteForm.tsx      | ✅     |
| SellerQuoteModal.tsx     | ✅     |
| ProfileScreen.tsx        | ✅     |
| EditProfileScreen.tsx    | ✅     |
| HelpScreen.tsx           | ✅     |
| CreditsScreen.tsx        | ✅     |
| NotificationsScreen.tsx  | ✅     |
| WaitlistScreen.tsx       | ✅     |

### Phase 4 — Components — ✅ Done

| Component            | Status                               |
| -------------------- | ------------------------------------ |
| BottomTabBar.tsx     | ✅                                   |
| ErrorState.tsx       | ✅                                   |
| WilayaPicker.tsx     | ✅ (58 wilaya names + picker labels) |
| SpecialtiesSheet.tsx | ✅ (counts + "Done")                 |
| UserAvatar.tsx       | ✅ (fallback initial)                |

### Phase 5 — Static Data — ✅ Done

- 58 wilaya names translated in EN/FR/AR via `wilaya.*` keys
- 16+ seller specialties translated via `specialties.*` keys

### TypeScript — ✅ Clean

`npx tsc --noEmit` passes with zero errors.

---

## Translation Key Structure

```
auth.*              → LoginScreen, auth flows
splash.*            → SplashScreen slides, buttons
onboarding.*        → OnboardingScreen steps, roles, fields
home.*              → HomeScreen, SellerHomeScreen
marketplace.*       → MarketplaceScreen
requests.*          → MyRequestsScreen
requestDetails.*    → RequestDetailsScreen
wizard.*            → NewRequestScreen wizard steps
quotes.*            → MyQuotesScreen, SubmitQuoteScreen
profile.*           → ProfileScreen
editProfile.*       → EditProfileScreen
credits.*           → CreditsScreen
notifications.*     → NotificationsScreen
waitlist.*          → WaitlistScreen
help.*              → HelpScreen
seller.*            → SellerHomeScreen dashboard
nav.*               → BottomTabBar labels
wilayaPicker.*      → WilayaPicker component
specialtiesSheet.*  → SpecialtiesSheet component
error.*             → ErrorState component
common.*            → Shared buttons, statuses, labels
specialties.*       → Seller specialties/categories
wilaya.*            → 58 wilaya names (01–58)
```

## Files created (8)

```
mobile/src/i18n/index.ts
mobile/src/i18n/locales/en.json
mobile/src/i18n/locales/fr.json
mobile/src/i18n/locales/ar.json
mobile/src/screens/LanguageSelectScreen.tsx
mobile/plans/i18n-plan.md
```

## Files modified (~30)

```
mobile/App.tsx
mobile/package.json
mobile/src/navigation/types.ts
mobile/src/navigation/RootNavigator.tsx
mobile/src/screens/SplashScreen.tsx + 24 other screen files
mobile/src/components/BottomTabBar.tsx + ~5 component files
```

## RTL Carousel fix — PagerView + transparent overlay (May 29, 2026)

### Root cause of earlier failures

- `scaleX: -1` is visual-only — doesn't affect native gesture recognition on PagerView
- `inverted` FlatList in RTL produces conflicting coordinate systems
- `layoutDirection="rtl"` on PagerView is bugged on Android (callstack/react-native-pager-view#767)
- `PanResponder` on the PARENT View of PagerView doesn't work because the native ViewPager2 consumes touches before they reach the JS parent
- `react-native-reanimated-carousel` v4.0.3 incompatible with Reanimated ~4.1.1 on Expo SDK 54; RNGH ^3.0.0 breaks Expo Go's bundled RNGH

### Working approach — PagerView + transparent overlay ON TOP

The key insight: instead of `pointerEvents="none"` on PagerView or PanResponder on the parent, render a **transparent View with `StyleSheet.absoluteFill` as a sibling AFTER PagerView**. This overlay sits on top (natural z-order of the render tree) and captures all touches via `onStartShouldSetPanResponder: () => true`.

1. **PagerView**: always `layoutDirection="ltr"`, slides always 0→N-1 left-to-right
2. **LTR mode**: native PagerView scroll (`scrollEnabled={true}`), no overlay, `onPageScroll` drives scroll-linked animations via `Animated.add(position, offset)` — real-time, follows the finger
3. **RTL mode**: `scrollEnabled={false}` + transparent overlay on top captures ALL touches. PanResponder maps: RIGHT swipe (dx > 50) → `setPage(cur+1)` (NEXT), LEFT swipe (dx < -50) → `setPage(cur-1)` (PREVIOUS)
4. **Transition animation in RTL**: `Animated.timing(animatedIndex, currentIndex)` on `onPageSelected` provides a smooth 250ms crossfade (since `onPageScroll` doesn't fire for programmatic `setPage()`)
5. **CTA button**: `setPage(currentIndex + 1)` — always triggers `onPageSelected`

### Architecture

| Layer             | LTR (EN/FR)                                          | RTL (AR)                                                        |
| ----------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| Gesture handling  | Native PagerView scroll                              | Transparent overlay on top → PanResponder                       |
| Scroll prop       | `scrollEnabled={true}`                               | `scrollEnabled={false}` (safety, overlay steals touches anyway) |
| Animation source  | `Animated.add(position, offset)` from `onPageScroll` | `Animated.timing(animatedIndex)` on index change                |
| Direction mapping | LEFT swipe → NEXT                                    | RIGHT swipe → NEXT (dx > 50 → cur + 1)                          |
| CTA button        | `setPage(nextIndex)` → `onPageSelected`              | same                                                            |

### Key code (PanResponder overlay in RTL)

```tsx
<View style={{ flex: 1 }}>
  <PagerView ref={pagerRef} style={StyleSheet.absoluteFill} layoutDirection="ltr"
    scrollEnabled={!I18nManager.isRTL}
    onPageScroll={I18nManager.isRTL ? undefined : onPageScroll}
    onPageSelected={onPageSelected}
  >
    {SLIDES.map(...)}
  </PagerView>
  {/* RTL: overlay ON TOP of PagerView captures touches */}
  {I18nManager.isRTL && (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
  )}
</View>
```

### To test

```bash
npx expo start -c
```

Verify in Arabic mode:

- Slides appear in order 1 → 2 → 3 → 4
- Content text visible (not invisible)
- Swipe right to advance
- Shimmer sweeps correct direction in RTL
- Arrow icon on left side in RTL
- Same tests pass in English mode (LEFT swipe to advance)

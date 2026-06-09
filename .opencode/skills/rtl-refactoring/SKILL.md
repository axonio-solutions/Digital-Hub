---
name: rtl-refactoring
description: RTL support patterns for React Native — migrate from I18nManager to expo-rtl
---

# RTL Refactoring Guide

Step-by-step guide for converting a React Native screen from `I18nManager.isRTL`/`I18nManager.forceRTL()` to expo-rtl's reactive context-based direction system.

## Prerequisites

- `expo-rtl` installed in `mobile/`
- `DirectionProvider` wrapping the app (done in Phase 1 — see `plans/i18n-plan.md`)
- `useIsRTL` and `View` from `expo-rtl` available to import

## Pattern 1 — Replace `I18nManager.isRTL` with `useIsRTL()`

Before:

```tsx
import { I18nManager } from 'react-native'

// In render:
<I18nManager.isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
```

After:

```tsx
import { useIsRTL } from 'expo-rtl'

function MyScreen() {
  const isRTL = useIsRTL()

  // In render:
  isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'
}
```

The hook returns a reactive boolean — the component re-renders when direction changes.

## Pattern 2 — PanResponder / ref-safe direction access

PanResponders are created once in `useRef`. Closures inside them capture the initial value. Use a ref to access current direction at gesture time:

```tsx
import { useIsRTL } from 'expo-rtl'

function MyScreen() {
  const isRTL = useIsRTL()
  const isRTLRef = useRef(isRTL)
  useEffect(() => {
    isRTLRef.current = isRTL
  }, [isRTL])

  const panResponder = useRef(
    PanResponder.create({
      onPanResponderMove: (_, gs) => {
        const rtl = isRTLRef.current
        // ... use rtl (not I18nManager.isRTL)
      },
      onPanResponderRelease: (_, gs) => {
        const rtl = isRTLRef.current
        // ... use rtl
      },
    }),
  ).current

  // ...
}
```

## Pattern 3 — Reverse element order with `flexDirection`

For a row where you want elements swapped in RTL (logo↔skip button, text↔icon, prefix↔link):

```tsx
import { useIsRTL } from 'expo-rtl'

function MyScreen() {
  const isRTL = useIsRTL()

  return (
    <View
      style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
    >
      <View>{/* logo — right side in RTL */}</View>
      <View>{/* skip button — left side in RTL */}</View>
    </View>
  )
}
```

Works for Pressables too:

```tsx
<Pressable
  style={({ pressed }) => [
    styles.signInRow,
    { flexDirection: isRTL ? 'row-reverse' : 'row' },
    pressed && { opacity: 0.6 },
  ]}
>
```

### ⚠️ Important: expo-rtl View vs RN View

- **RN View** / **Pressable** — does **not** auto-flip `flexDirection`. Use `isRTL ? 'row-reverse' : 'row'` explicitly.
- **expo-rtl View** — **auto-flips** `flexDirection: 'row'` ↔ `row-reverse` AND `alignItems` `flex-start` ↔ `flex-end` in RTL mode.
  - Do **NOT** use `isRTL ? 'row-reverse' : 'row'` with expo-rtl View — it causes a **double-flip** (expo-rtl sees `row-reverse` and flips it back to `row`).
  - Instead, just use `flexDirection: 'row'` and let expo-rtl handle the flip automatically.
  - For `alignItems`, use `'center'` (safe, no flip) or wrap in a `dir="ltr"` View to prevent flipping.

**Rule of thumb:**

- `import { View } from 'expo-rtl'` → `flexDirection: 'row'` (auto-flips)
- `import { Pressable } from 'react-native'` → `flexDirection: isRTL ? 'row-reverse' : 'row'` (manual)

### Real-world bug: section heading label stuck on the left in RTL

```tsx
// ❌ BROKEN — double-flip on expo-rtl View
const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: isRTL ? 'row-reverse' : 'row', // ① isRTL=true → 'row-reverse'
    alignItems: 'center',                           // ② expo-rtl View sees 'row-reverse'
    justifyContent: 'space-between',                //    and FLIPS it back to 'row'
  },                                                // ③ Net result: first child on LEFT
})

// ✅ FIXED — let expo-rtl handle the flip
const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: 'row',  // expo-rtl auto-flips to 'row-reverse' in RTL
    alignItems: 'center',  // 'center' is direction-agnostic
    justifyContent: 'space-between',
  },
})
```

## Pattern 4 — Direction-aware alignment with `alignSelf`

For elements that should align to the "start" side per direction (icon shape, divider line):

```tsx
<View style={[styles.iconArea, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
```

- LTR: `flex-start` → left-aligned
- RTL: `flex-end` → right-aligned

Applies to any element where the cross-axis alignment should flip.

## Pattern 5 — Lock elements to LTR with `dir="ltr"`

For elements that should never reverse (e.g., pagination numbers 1 2 3 4):

```tsx
import { View } from 'expo-rtl'
;<View dir="ltr" style={styles.numbers}>
  {numbers.map((n) => (
    <Text key={n}>{n}</Text>
  ))}
</View>
```

This keeps the child order unchanged regardless of the parent direction. Requires importing `View` from `expo-rtl` (not `react-native`).

## Pattern 6 — Direction-aware shimmer / decorative positioning

For elements positioned via absolute offsets that need to flip:

```tsx
// Before:
<I18nManager.isRTL ? { right: 0 } : { left: 0 }>

// After:
isRTL ? { right: 0 } : { left: 0 }
```

Works because `isRTL` is already a local variable from `useIsRTL()`.

## Pattern 7 — Shimmer animation direction

For `Animated.Value` initial values that depend on direction:

```tsx
const shimmerX = useRef(new Animated.Value(isRTL ? 100 : -100)).current
```

The `useRef` initializer runs once — safe because direction doesn't change while this screen is mounted.

## Pattern 8 — Text alignment with expo-rtl Text

expo-rtl's `Text` component **also auto-flips** `textAlign` values:
- `textAlign: 'left'` → auto-flips to `'right'` in RTL
- `textAlign: 'right'` → auto-flips to `'left'` in RTL
- No `textAlign` set → defaults to `'right'` in RTL, `'left'` in LTR

For start-aligned text per direction:

```tsx
// ✅ Correct: expo-rtl Text flips 'left' → 'right' in RTL
<Text style={{ textAlign: 'left' }}>
  This will be right-aligned in RTL
</Text>

// ✅ Also correct: no textAlign, expo-rtl auto-defaults
<Text>
  This will also be right-aligned in RTL
</Text>
```

```tsx
// ❌ BROKEN: double-flip with conditional
// In RTL, 'right' gets flipped back to 'left' by expo-rtl
<Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
  This stays on the LEFT in RTL
</Text>
```

> **Why:** expo-rtl's `VALUE_FLIP` map swaps `left`↔`right` for `textAlign`. The conditional produces `'right'` in RTL, which expo-rtl then flips to `'left'`.

For center-aligned text, use `textAlign: 'center'` (direction-agnostic):

```tsx
<Text style={{ textAlign: 'center' }}>
  Works identically in LTR and RTL
</Text>
```

To opt out of the flip entirely, use the `noFlip` prop with your own conditional:

```tsx
<Text noFlip style={{ textAlign: isRTL ? 'right' : 'left' }}>
  Manually aligned — no expo-rtl interference
</Text>
```

## Pattern 9 — Slide / carousel translateX direction

For horizontal slide transitions that should scroll opposite in RTL:

```tsx
const translateX = pos.interpolate({
  inputRange: [index - 1, index, index + 1],
  outputRange: isRTL
    ? [-slideOffset, 0, slideOffset] // RTL: new from left
    : [slideOffset, 0, -slideOffset], // LTR: new from right
  extrapolate: 'clamp',
})
```

## Pattern 10 — Decorative absolute positioning

For decorative elements (accent dots, rings, bars) that use physical `left`/`right` positioning:

```tsx
// Before — always on the right:
headerAccentDot: {
  position: 'absolute',
  top: 10,
  right: 14,
}

// After — flip based on direction:
<View style={[styles.headerAccentDot, isRTL ? { left: 14 } : { right: 14 }]} />
```

For elements with border radii that should also flip:

```tsx
bannerAccent: {
  position: 'absolute',
  left: 0,       // will be right: 0 in RTL
  top: 0,
  bottom: 0,
  width: 3.5,
  borderTopLeftRadius: 12,     // → borderTopRightRadius in RTL
  borderBottomLeftRadius: 12,  // → borderBottomRightRadius in RTL
}

// Inline override:
<View style={[
  styles.bannerAccent,
  isRTL
    ? {
        right: 0, left: undefined,
        borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
        borderTopRightRadius: 12, borderBottomRightRadius: 12,
      }
    : { left: 0 },
]} />
```

## Pattern 11 — Drop-in expo-rtl components for auto-flipping

Replace RN primitives with expo-rtl versions in shared components. They auto-flip styles (padding, margin, border, flexDirection, textAlign) based on the `DirectionProvider` context — no manual `isRTL` conditionals needed.

**Before:**

```tsx
import { View, Text, TextInput } from 'react-native'

// Manual RTL with conditionals everywhere
```

**After:**

```tsx
import { StyleSheet } from 'react-native'
import { View, Text, TextInput } from 'expo-rtl'
// Keep RN types as type-only imports
import type { TextInput as RNTextInput, TextInputProps } from 'react-native'
```

expo-rtl components auto-flip:

- `flexDirection: 'row'` ↔ `row-reverse`
- `paddingLeft` ↔ `paddingRight`, `marginLeft` ↔ `marginRight`
- `borderLeftWidth` ↔ `borderRightWidth`, `left` ↔ `right`
- `borderTopLeftRadius` ↔ `borderTopRightRadius`
- `textAlign: 'left'` ↔ `'right'`
- `alignItems`/`alignSelf` `flex-start` ↔ `flex-end`

This is ideal for shared primitives like `Field.tsx` (form inputs, labels, icons) because every screen that uses them gets RTL for free.

**Type note:** `forwardRef` needs the RN type, not the component value:

```tsx
import type { TextInput as RNTextInput } from 'react-native'

// Use RN type for ref, expo-rtl component for render
export const Field = forwardRef<RNTextInput, FieldProps>(function Field(…) {
  return (
    <>
      <Text>{label}</Text>            {/* expo-rtl auto-aligns */}
      <View style={styles.inputBox}>  {/* auto-flips row direction */}
        {icon}
        <TextInput ref={ref} />       {/* auto-flips padding */}
      </View>
    </>
  )
})
```

## Pattern 12 — Tab indicator with direction-aware animation

For a tab toggle where the active indicator slides between tabs:

```tsx
function switchMode(next: Mode) {
  // Tab ORDER is always [sign-in, sign-up] in the render tree
  // In RTL, row-reverse flips visual order so sign-in appears on the right
  // map indicator position accordingly:
  const targetLeft = next === 'sign-in'
    ? (isRTL ? tabWidth : 0)    // RTL: sign-in on right (tabWidth away)
    : (isRTL ? 0 : tabWidth)    // LTR: sign-in on left (0)

  Animated.spring(tabIndicatorLeft, { toValue: targetLeft, ... }).start()
}
```

## Pattern 13 — Progress bar with absolutely positioned value

For progress bars where the numeric value is absolutely positioned at the bar's end:

```tsx
// Before — value flips to left in RTL (start of bar, not end):
<Text style={[styles.value, isRTL ? { left: 0 } : { right: 0 }]}>
  {value}
</Text>

// After — value stays on the right (end of bar fill, which always grows left→right):
<Text style={[styles.value, { right: 0 }]}>
  {value}
</Text>
```

**Reason:** Progress bars always fill left-to-right regardless of language direction (like time charts and data visualizations). The value should remain at the fill's end (right side) in both LTR and RTL.

For elements where the parent is an expo-rtl View and the absolutely positioned child should still be on the "end" side, use `right: 0` unconditionally. The expo-rtl View's `flexDirection` auto-flip may reorder in-flow children, but absolutely positioned children are removed from flow and must be placed explicitly.

If you must flip the bar direction for RTL, wrap the track with `dir="ltr"` to prevent auto-flip of `alignItems` (which would break bottom-aligned bars), and keep the bar fill left-to-right.

## Full migration checklist

For each screen:

1. [ ] Import `useIsRTL` from `expo-rtl` instead of `I18nManager` from `react-native`
2. [ ] Call `const isRTL = useIsRTL()` at the top of the component
3. [ ] Add `isRTLRef` + `useEffect` sync if there's a PanResponder or other ref-based closure
4. [ ] Replace every `I18nManager.isRTL` with `isRTL` (or `isRTLRef.current` in closures)
5. [ ] Remove unused `I18nManager` import
6. [ ] For flex rows that should swap element order: `flexDirection: isRTL ? 'row-reverse' : 'row'` on RN Views / Pressables; use plain `flexDirection: 'row'` on expo-rtl Views (auto-flips)
7. [ ] For cross-axis alignment that should flip: `alignSelf: isRTL ? 'flex-end' : 'flex-start'`
8. [ ] For decorative absolute positioning (`left`/`right`): add conditional `isRTL ? { left: X } : { right: X }`
9. [ ] For elements that must stay LTR: import `View` from `expo-rtl` and add `dir="ltr"`
10. [ ] For animated values (shimmer initial position, gesture): use `isRTL` for start/end values
11. [ ] For shared primitives (Field, Button, etc.): swap `react-native` imports for `expo-rtl` components
12. [ ] For tab indicators: animate `left` based on `isRTL` mapping (RTL: sign-in→right)
13. [ ] For Text alignment: use `textAlign: 'left'` (expo-rtl flips to 'right' in RTL) or no textAlign at all; do NOT use `isRTL ? 'right' : 'left'` — causes double-flip
14. [ ] Run `npx tsc --noEmit` and verify no errors

---
name: mobile-rtl-refactoring
description: Complete RTL support patterns for React Native mobile app — migrate from I18nManager to expo-rtl with real-world examples
---

# Mobile RTL Refactoring Guide

Comprehensive step-by-step guide for converting React Native screens from `I18nManager.isRTL`/`I18nManager.forceRTL()` to expo-rtl's reactive context-based direction system, based on actual refactoring of ProfileScreen, EditProfileScreen, HelpScreen, and NewRequestScreen.

## Prerequisites

- `expo-rtl` installed in `mobile/`
- `DirectionProvider` wrapping the app (done in Phase 1)
- `useIsRTL`, `View`, `Text`, `ScrollView`, `TextInput` from `expo-rtl` available to import

## Pattern 1 — Replace I18nManager with useIsRTL Hook

**Before:**

```tsx
import { I18nManager, View, Text } from 'react-native'

const chevron = I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'
```

**After:**

```tsx
import { View, Text, useIsRTL } from 'expo-rtl'

function MyScreen() {
  const isRTL = useIsRTL()
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward'
}
```

The hook returns a reactive boolean — the component re-renders when direction changes.

## Pattern 2 — Import expo-rtl Components

Replace React Native primitives with expo-rtl versions. They auto-flip styles based on direction.

**Before:**

```tsx
import { ScrollView, Text, TextInput, View } from 'react-native'
```

**After:**

```tsx
import { StyleSheet, Pressable, Modal } from 'react-native'
import { ScrollView, Text, TextInput, View, useIsRTL } from 'expo-rtl'
```

**Keep in react-native:** `StyleSheet`, `Pressable`, `Modal`, `ActivityIndicator`, `Animated`, `Platform`, `KeyboardAvoidingView`, `Image` (from expo-image)

**Move to expo-rtl:** `View`, `Text`, `ScrollView`, `TextInput`

## Pattern 3 — Update makeStyles to Accept isRTL

**Before:**

```tsx
function makeStyles(t: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      // ...
    },
  })
}

// Usage
const styles = makeStyles(t)
```

**After:**

```tsx
function makeStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      // ...
    },
  })
}

// Usage
const isRTL = useIsRTL()
const styles = makeStyles(t, isRTL)
```

## Pattern 4 — Direction-Aware flexDirection

For rows where element order should swap in RTL:

**Before:**

```tsx
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
```

**After:**

```tsx
header: {
  flexDirection: isRTL ? 'row-reverse' : 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
```

**Apply to:**

- Headers with back button and title
- Rows with icon + text
- Button groups
- Form fields with prefix/suffix icons
- Navigation bars
- Card layouts with image + content

## Pattern 5 — Inline Style flexDirection

For inline styles that need RTL support:

**Before:**

```tsx
<View style={{ flexDirection: 'row', gap: 8 }}>
```

**After:**

```tsx
<View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
```

## Pattern 6 — Direction-Aware Absolute Positioning

For decorative elements or badges positioned with left/right:

**Before:**

```tsx
statusDot: {
  position: 'absolute',
  bottom: 2,
  right: 2,
  width: 14,
  height: 14,
}
```

**After:**

```tsx
statusDot: {
  position: 'absolute',
  bottom: 2,
  width: 14,
  height: 14,
}

// In component:
<View
  style={[
    styles.statusDot,
    isRTL ? { left: 2 } : { right: 2 },
  ]}
/>
```

**Remove hardcoded left/right from styles, apply conditionally in component.**

## Pattern 7 — Direction-Aware Margins and Padding

For directional spacing that should flip:

**Before:**

```tsx
<Text style={{ fontSize: 22, marginRight: 12 }}>
```

**After:**

```tsx
<Text style={{
  fontSize: 22,
  marginRight: isRTL ? 0 : 12,
  marginLeft: isRTL ? 12 : 0
}}>
```

**Note:** expo-rtl components auto-flip `paddingLeft`/`paddingRight` and `marginLeft`/`marginRight` in styles, but inline styles may need manual handling.

## Pattern 8 — Icon Direction

For directional icons (arrows, chevrons):

**Before:**

```tsx
<Ionicons name="chevron-forward" size={18} />
```

**After:**

```tsx
<Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} />
```

**Common icon pairs:**

- `arrow-forward` ↔ `arrow-back`
- `chevron-forward` ↔ `chevron-back`
- `arrow-forward-outline` ↔ `arrow-back-outline`

## Pattern 9 — Multiple Style Functions

When you have multiple style functions (e.g., `makeStyles`, `makeCatStyles`):

**Before:**

```tsx
function makeCatStyles(t: Theme) {
  /* ... */
}
function makeStyles(t: Theme) {
  /* ... */
}

// Usage
const catStyles = makeCatStyles(t)
const styles = makeStyles(t)
```

**After:**

```tsx
function makeCatStyles(t: Theme, isRTL: boolean) {
  /* ... */
}
function makeStyles(t: Theme, isRTL: boolean) {
  /* ... */
}

// Usage
const isRTL = useIsRTL()
const catStyles = makeCatStyles(t, isRTL)
const styles = makeStyles(t, isRTL)
```

## Pattern 10 — Nested Components with Styles

When child components have their own style functions:

**Before:**

```tsx
function CategoryCard({ label, icon }: Props) {
  const t = useTheme()
  const catStyles = makeCatStyles(t)
  // ...
}
```

**After:**

```tsx
function CategoryCard({ label, icon }: Props) {
  const t = useTheme()
  const isRTL = useIsRTL()
  const catStyles = makeCatStyles(t, isRTL)
  // ...
}
```

**Each component that uses styles needs its own `useIsRTL()` call.**

## Pattern 11 — Language Selection Rows

For language picker rows that should flip:

**Before:**

```tsx
<Pressable style={styles.menuRow}>
  <Text style={{ fontSize: 22, marginRight: 12 }}>{flag}</Text>
  <Text>{label}</Text>
  <Ionicons name="checkmark-outline" />
</Pressable>
```

**After:**

```tsx
<Pressable
  style={[styles.menuRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
>
  <Text
    style={{
      fontSize: 22,
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    }}
  >
    {flag}
  </Text>
  <Text>{label}</Text>
  <Ionicons name="checkmark-outline" />
</Pressable>
```

## Pattern 12 — KeyboardAvoidingView and Footer Buttons

For sticky footer buttons that should remain accessible with keyboard:

**Structure:**

```tsx
<View style={styles.root}>
  <View style={styles.header}>...</View>

  <KeyboardAvoidingView
    style={styles.kav}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView>{/* Content */}</ScrollView>
  </KeyboardAvoidingView>

  {/* Footer OUTSIDE KeyboardAvoidingView for sticky positioning */}
  <View style={styles.footer}>
    <Pressable style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} />
      <Text>Back</Text>
    </Pressable>
  </View>
</View>
```

**Key points:**

- Footer stays outside `KeyboardAvoidingView` to remain sticky
- `KeyboardAvoidingView` wraps only the scrollable content
- Footer buttons use RTL-aware flexDirection

## Real-World Examples

### Example 1: ProfileScreen Header

**Before:**

```tsx
import { I18nManager, View, Text, ScrollView } from 'react-native'

const chevron = I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'

<View style={styles.headerCard}>
  <View style={styles.avatarWrap}>
    <Image source={{ uri: avatarUrl }} />
    <View style={styles.statusDot} />
  </View>
</View>

// Styles
statusDot: {
  position: 'absolute',
  bottom: 2,
  right: 2,
}
```

**After:**

```tsx
import { View, Text, ScrollView, useIsRTL } from 'expo-rtl'

const isRTL = useIsRTL()
const chevron = isRTL ? 'chevron-back' : 'chevron-forward'

<View style={styles.headerCard}>
  <View style={styles.avatarWrap}>
    <Image source={{ uri: avatarUrl }} />
    <View
      style={[
        styles.statusDot,
        isRTL ? { left: 2 } : { right: 2 }
      ]}
    />
  </View>
</View>

// Styles
statusDot: {
  position: 'absolute',
  bottom: 2,
  // left/right applied conditionally
}
```

### Example 2: EditProfileScreen with Multiple flexDirection

**Before:**

```tsx
function makeStyles(t: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarBtn: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })
}
```

**After:**

```tsx
function makeStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    avatarBtn: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: spacing.xs,
    },
    cardHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
  })
}

const isRTL = useIsRTL()
const styles = makeStyles(t, isRTL)
```

### Example 3: HelpScreen with Nested Components

**Before:**

```tsx
function makeCatStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      borderLeftWidth: 5,
    },
  })
}

function CategoryCard({ label }: Props) {
  const t = useTheme()
  const catStyles = makeCatStyles(t)
  return <Pressable style={catStyles.card}>...</Pressable>
}

export function HelpScreen() {
  const t = useTheme()
  const styles = makeStyles(t)
  // ...
}
```

**After:**

```tsx
function makeCatStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    card: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      // Remove borderLeftWidth, handle conditionally
    },
  })
}

function CategoryCard({ label }: Props) {
  const t = useTheme()
  const isRTL = useIsRTL()
  const catStyles = makeCatStyles(t, isRTL)
  return <Pressable style={catStyles.card}>...</Pressable>
}

export function HelpScreen() {
  const t = useTheme()
  const isRTL = useIsRTL()
  const styles = makeStyles(t, isRTL)
  // ...
}
```

## Full Migration Checklist

For each screen:

### Phase 1: Imports

- [ ] Import `useIsRTL` from `expo-rtl`
- [ ] Move `View`, `Text`, `ScrollView`, `TextInput` imports from `react-native` to `expo-rtl`
- [ ] Keep `StyleSheet`, `Pressable`, `Modal`, `ActivityIndicator`, `Animated` in `react-native`
- [ ] Remove unused `I18nManager` import

### Phase 2: Hook Setup

- [ ] Add `const isRTL = useIsRTL()` at the top of the component
- [ ] Update all `makeStyles(t)` calls to `makeStyles(t, isRTL)`
- [ ] Update all style function signatures to accept `isRTL: boolean`

### Phase 3: Replace I18nManager

- [ ] Replace every `I18nManager.isRTL` with `isRTL`
- [ ] Update icon names: `isRTL ? 'arrow-back' : 'arrow-forward'`

### Phase 4: Update Styles

- [ ] Update all `flexDirection: 'row'` to `flexDirection: isRTL ? 'row-reverse' : 'row'`
- [ ] Find absolute positioned elements with `left`/`right` and make conditional
- [ ] Update inline styles with directional properties

### Phase 5: Nested Components

- [ ] For each child component with styles, add `useIsRTL()` hook
- [ ] Update child component style function calls

### Phase 6: Test

- [ ] Run `npx tsc --noEmit` and verify no errors
- [ ] Test in English (LTR)
- [ ] Test in Arabic (RTL)
- [ ] Test language switching
- [ ] Test with keyboard open (for forms)

## Common Patterns Summary

| Pattern           | Before                                | After                                                     |
| ----------------- | ------------------------------------- | --------------------------------------------------------- |
| **Imports**       | `import { View } from 'react-native'` | `import { View, useIsRTL } from 'expo-rtl'`               |
| **Hook**          | `I18nManager.isRTL`                   | `const isRTL = useIsRTL()`                                |
| **Styles**        | `makeStyles(t)`                       | `makeStyles(t, isRTL)`                                    |
| **FlexDirection** | `flexDirection: 'row'`                | `flexDirection: isRTL ? 'row-reverse' : 'row'`            |
| **Icons**         | `name="arrow-forward"`                | `name={isRTL ? 'arrow-back' : 'arrow-forward'}`           |
| **Position**      | `right: 2` in styles                  | `isRTL ? { left: 2 } : { right: 2 }` inline               |
| **Margins**       | `marginRight: 12`                     | `marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0` |

## Translation Integration

When refactoring RTL, also ensure translations are complete:

### Check Translation Keys

```bash
grep -n "i18n('key')" ScreenName.tsx
```

### Add Missing Keys

If you find untranslated text, add to all three files:

- `mobile/src/i18n/locales/en.json`
- `mobile/src/i18n/locales/fr.json`
- `mobile/src/i18n/locales/ar.json`

### Example: Adding WhatsApp Translation

```json
// en.json
"editProfile": {
  "phone": "Phone",
  "whatsapp": "WhatsApp"
}

// fr.json
"editProfile": {
  "phone": "Téléphone",
  "whatsapp": "WhatsApp"
}

// ar.json
"editProfile": {
  "phone": "رقم الهاتف",
  "whatsapp": "واتساب"
}
```

## Troubleshooting

### Issue: Component doesn't re-render on language change

**Solution:** Ensure you're using `useIsRTL()` hook, not `I18nManager.isRTL`

### Issue: Styles not flipping

**Solution:** Check that you're passing `isRTL` to `makeStyles(t, isRTL)`

### Issue: Icons pointing wrong direction

**Solution:** Use conditional icon names: `isRTL ? 'arrow-back' : 'arrow-forward'`

### Issue: Absolute positioned elements in wrong place

**Solution:** Remove `left`/`right` from styles, apply conditionally inline

### Issue: Footer buttons hidden by keyboard

**Solution:** Move footer outside `KeyboardAvoidingView`

### Issue: Duplicate keys in lists

**Solution:** Use unique keys like `icon` or `id`, not translated `label`

## Benefits of This Approach

✅ **Reactive** - Components re-render when direction changes
✅ **Auto-flipping** - expo-rtl components handle most transformations
✅ **Type-safe** - TypeScript catches missing isRTL parameters
✅ **Maintainable** - Centralized direction logic
✅ **Consistent** - Same pattern across all screens
✅ **Testable** - Easy to test both LTR and RTL modes

## Files Refactored (Reference)

- ✅ `ProfileScreen.tsx` - Avatar positioning, language rows, status dot
- ✅ `EditProfileScreen.tsx` - 11 flexDirection instances, form layouts
- ✅ `HelpScreen.tsx` - Nested components, category cards, 9 flexDirection instances
- ✅ `NewRequestScreen.tsx` - Wizard navigation, sticky footer, keyboard handling
- ✅ `CategoryStep.tsx` - Category translation utility integration

## Next Steps

After refactoring a screen:

1. Test thoroughly in both LTR and RTL
2. Check all interactive elements (buttons, inputs, modals)
3. Verify keyboard behavior for forms
4. Test language switching
5. Update this skill with any new patterns discovered

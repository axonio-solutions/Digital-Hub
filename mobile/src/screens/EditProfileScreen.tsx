import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import {
  deactivateAccountFn,
  deleteAccountFn,
  fetchSession,
  updateProfileFn,
} from '../lib/api-client'
import type { SessionUser, UpdateProfileInput } from '../lib/api-client'

const C = {
  green: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  blue: '#2563EB',
} as const

interface EditProfileScreenProps {
  user: SessionUser
  onSave: (user: SessionUser) => void
  onCancel: () => void
}

const WILAYAS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Bejaia',
  'Biskra',
  'Bechar',
  'Blida',
  'Bouira',
  'Tamanrasset',
  'Tebessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Algiers',
  'Djelfa',
  'Jijel',
  'Setif',
  'Saida',
  'Skikda',
  'Sidi Bel Abbes',
  'Annaba',
  'Guelma',
  'Constantine',
  'Medea',
  'Mostaganem',
  "M'Sila",
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
  'Illizi',
  'Bordj Bou Arreridj',
  'Boumerdes',
  'El Tarf',
  'Tindouf',
  'Tissemsilt',
  'El Oued',
  'Khenchela',
  'Souk Ahras',
  'Tipaza',
  'Mila',
  'Ain Defla',
  'Naama',
  'Ain Temouchent',
  'Ghardaia',
  'Relizane',
]

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export function EditProfileScreen({
  user,
  onSave,
  onCancel,
}: EditProfileScreenProps) {
  const t = useTheme()
  const scrollRef = useRef<ScrollView>(null)

  const [name, setName] = useState(user.name || '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [whatsappNumber, setWhatsappNumber] = useState(
    user.whatsappNumber || '',
  )
  const [wilaya, setWilaya] = useState(user.wilaya || '')
  const [city, setCity] = useState(user.city || '')
  const [address, setAddress] = useState(user.address || '')
  const [storeName, setStoreName] = useState(user.storeName || '')
  const [companyAddress, setCompanyAddress] = useState(
    user.companyAddress || '',
  )
  const [commercialRegister, setCommercialRegister] = useState(
    user.commercialRegister || '',
  )
  const [avatarUrl, setAvatarUrl] = useState(user.image || '')

  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showWilayaPicker, setShowWilayaPicker] = useState(false)
  const [wilayaSearch, setWilayaSearch] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [infoTitle, setInfoTitle] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const svBackdrop = useRef(new Animated.Value(0)).current
  const svScale = useRef(new Animated.Value(0.5)).current
  const svOpacity = useRef(new Animated.Value(0)).current
  const svCheck = useRef(new Animated.Value(0)).current
  const svSlide = useRef(new Animated.Value(30)).current

  const cfBackdrop = useRef(new Animated.Value(0)).current
  const cfScale = useRef(new Animated.Value(0.5)).current
  const cfOpacity = useRef(new Animated.Value(0)).current

  const isSeller = user.role === 'seller'

  const filteredWilayas = useMemo(
    () =>
      WILAYAS.filter((w) =>
        w.toLowerCase().includes(wilayaSearch.toLowerCase()),
      ),
    [wilayaSearch],
  )

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.timing(svBackdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(svScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(svOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(svSlide, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start()
      Animated.spring(svCheck, {
        toValue: 1,
        friction: 5,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }).start()
    } else {
      svBackdrop.setValue(0)
      svScale.setValue(0.5)
      svOpacity.setValue(0)
      svCheck.setValue(0)
      svSlide.setValue(30)
    }
  }, [showSuccess])

  useEffect(() => {
    if (showDeactivateConfirm || showDeleteConfirm) {
      Animated.parallel([
        Animated.timing(cfBackdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(cfScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(cfOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      cfBackdrop.setValue(0)
      cfScale.setValue(0.5)
      cfOpacity.setValue(0)
    }
  }, [showDeactivateConfirm, showDeleteConfirm])

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setInfoTitle('Permission Needed')
      setInfoMessage('Camera roll access is required to change your avatar.')
      setShowInfo(true)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setUploadingAvatar(true)
    try {
      const ext = asset.fileName?.split('.').pop() || 'jpg'
      const fileName = `${user.id}/avatar-${Date.now()}.${ext}`

      const formData = new FormData()
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || `image/${ext}`,
        name: fileName,
      } as any)

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/profiles/${fileName}`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: formData,
        },
      )

      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => '')
        throw new Error(`Upload failed: ${uploadRes.status} ${text}`)
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profiles/${fileName}`
      setAvatarUrl(publicUrl)
    } catch (err) {
      setErrorMessage('Could not upload avatar.')
      setShowError(true)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Fill in all password fields.')
      setShowError(true)
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.')
      setShowError(true)
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setShowError(true)
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || ''}/api/auth/change-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      )

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Password change failed')
      }

      setSuccessMessage('Password updated.')
      setShowSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not change password.')
      setShowError(true)
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates: UpdateProfileInput = {
        name: name.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        wilaya: wilaya.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        image: avatarUrl || undefined,
      }

      if (isSeller) {
        updates.storeName = storeName.trim() || undefined
        updates.companyAddress = companyAddress.trim() || undefined
        updates.commercialRegister = commercialRegister.trim() || undefined
      }

      await updateProfileFn(user.id, updates)

      const fresh = await fetchSession()
      setSuccessMessage('Profile updated.')
      setShowSuccess(true)
      setTimeout(() => onSave(fresh || user), 1200)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not save profile.')
      setShowError(true)
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivateConfirm() {
    setShowDeactivateConfirm(true)
  }

  async function confirmDeactivate() {
    setShowDeactivateConfirm(false)
    try {
      await deactivateAccountFn(user.id)
      setSuccessMessage('Account deactivated.')
      setShowSuccess(true)
    } catch {
      setErrorMessage('Could not deactivate account.')
      setShowError(true)
    }
  }

  function handleDeleteConfirm() {
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    setShowDeleteConfirm(false)
    try {
      await deleteAccountFn(user.id)
      setSuccessMessage('Account deleted.')
      setShowSuccess(true)
    } catch {
      setErrorMessage('Could not delete account.')
      setShowError(true)
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bgMuted }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: t.surface,
              borderBottomColor: t.border,
              paddingTop:
                Platform.OS === 'ios'
                  ? 54
                  : (StatusBar.currentHeight ?? 28) + spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: t.bgMuted },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={20} color={t.textMuted} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Edit Profile
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: C.blue },
              pressed && { opacity: 0.85 },
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    { backgroundColor: C.blue + '12' },
                  ]}
                >
                  <Text style={[styles.avatarInitial, { color: C.blue }]}>
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              {uploadingAvatar && (
                <ActivityIndicator
                  size="small"
                  color={C.blue}
                  style={styles.avatarLoading}
                />
              )}
            </Pressable>
            <Pressable
              onPress={handlePickAvatar}
              style={({ pressed }) => [
                styles.avatarBtn,
                { backgroundColor: C.blue + '12', borderColor: C.blue + '25' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="camera-outline" size={14} color={C.blue} />
              <Text style={[styles.avatarBtnText, { color: C.blue }]}>
                Change photo
              </Text>
            </Pressable>
          </View>

          {/* Personal Info */}
          <View
            style={[
              styles.card,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View style={[styles.cardHeader, { borderBottomColor: t.border }]}>
              <View
                style={[styles.cardIcon, { backgroundColor: C.blue + '12' }]}
              >
                <Ionicons name="person-outline" size={14} color={C.blue} />
              </View>
              <Text style={[styles.cardTitle, { color: t.text }]}>
                Personal Info
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Field
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                focused={focusedField === 'name'}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                t={t}
              />
              <Field
                label="Email"
                value={user.email}
                editable={false}
                focused={false}
                t={t}
              />
              <Field
                label="Phone"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone number"
                keyboardType="phone-pad"
                focused={focusedField === 'phone'}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                t={t}
              />
              <Field
                label="WhatsApp"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                placeholder="WhatsApp number"
                keyboardType="phone-pad"
                focused={focusedField === 'whatsapp'}
                onFocus={() => setFocusedField('whatsapp')}
                onBlur={() => setFocusedField(null)}
                t={t}
              />
            </View>
          </View>

          {/* Location */}
          <View
            style={[
              styles.card,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View style={[styles.cardHeader, { borderBottomColor: t.border }]}>
              <View
                style={[styles.cardIcon, { backgroundColor: C.blue + '12' }]}
              >
                <Ionicons name="location-outline" size={14} color={C.blue} />
              </View>
              <Text style={[styles.cardTitle, { color: t.text }]}>
                Location
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Pressable
                onPress={() => {
                  setWilayaSearch('')
                  setShowWilayaPicker(true)
                }}
                style={({ pressed }) => [
                  styles.field,
                  {
                    backgroundColor: t.bgMuted,
                    borderColor: t.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.fieldLabel, { color: t.textMuted }]}>
                  Wilaya
                </Text>
                <View style={styles.fieldValueRow}>
                  <Text
                    style={[
                      styles.fieldValue,
                      wilaya ? { color: t.text } : { color: t.textSubtle },
                    ]}
                  >
                    {wilaya || 'Select wilaya'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={t.textSubtle}
                  />
                </View>
              </Pressable>
              <Field
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="City"
                focused={focusedField === 'city'}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                t={t}
              />
              <Field
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Street address"
                focused={focusedField === 'address'}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                t={t}
              />
            </View>
          </View>

          {/* Business Info */}
          {isSeller && (
            <View
              style={[
                styles.card,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              <View
                style={[styles.cardHeader, { borderBottomColor: t.border }]}
              >
                <View
                  style={[styles.cardIcon, { backgroundColor: C.amber + '15' }]}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={C.amber}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: t.text }]}>
                  Business Info
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Field
                  label="Store Name"
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="Store name"
                  focused={focusedField === 'storeName'}
                  onFocus={() => setFocusedField('storeName')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
                <Field
                  label="Company Address"
                  value={companyAddress}
                  onChangeText={setCompanyAddress}
                  placeholder="Company address"
                  focused={focusedField === 'companyAddress'}
                  onFocus={() => setFocusedField('companyAddress')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
                <Field
                  label="Commercial Register"
                  value={commercialRegister}
                  onChangeText={setCommercialRegister}
                  placeholder="RC number"
                  focused={focusedField === 'commercialRegister'}
                  onFocus={() => setFocusedField('commercialRegister')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
              </View>
            </View>
          )}

          {/* Security */}
          <View
            style={[
              styles.card,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={({ pressed }) => [
                styles.cardHeader,
                { borderBottomColor: showPassword ? t.border : 'transparent' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  flex: 1,
                }}
              >
                <View
                  style={[styles.cardIcon, { backgroundColor: C.blue + '12' }]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={14}
                    color={C.blue}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: t.text }]}>
                  Security
                </Text>
              </View>
              <Ionicons
                name={showPassword ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={t.textSubtle}
              />
            </Pressable>
            {showPassword && (
              <View style={styles.cardBody}>
                <Field
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  focused={focusedField === 'currentPassword'}
                  onFocus={() => setFocusedField('currentPassword')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
                <Field
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  focused={focusedField === 'newPassword'}
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
                <Field
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  secureTextEntry
                  focused={focusedField === 'confirmPassword'}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  t={t}
                />
                <Pressable
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                  style={({ pressed }) => [
                    styles.fullBtn,
                    { backgroundColor: C.blue },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {changingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.fullBtnText}>Update Password</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Danger Zone */}
          <View
            style={[
              styles.card,
              { backgroundColor: t.dangerBg, borderColor: t.danger + '30' },
            ]}
          >
            <View
              style={[
                styles.cardHeader,
                { borderBottomColor: t.danger + '20' },
              ]}
            >
              <View
                style={[styles.cardIcon, { backgroundColor: t.danger + '15' }]}
              >
                <Ionicons name="warning-outline" size={14} color={t.danger} />
              </View>
              <Text style={[styles.cardTitle, { color: t.danger }]}>
                Danger Zone
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Pressable
                onPress={handleDeactivateConfirm}
                style={({ pressed }) => [
                  styles.dangerBtn,
                  { borderColor: t.danger + '30' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={18}
                  color={t.danger}
                />
                <Text style={[styles.dangerBtnText, { color: t.danger }]}>
                  Deactivate Account
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteConfirm}
                style={({ pressed }) => [
                  styles.dangerBtn,
                  { borderColor: t.danger + '30' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={t.danger} />
                <Text style={[styles.dangerBtnText, { color: t.danger }]}>
                  Delete Account
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Wilaya Picker */}
      <Modal
        visible={showWilayaPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWilayaPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowWilayaPicker(false)}
        >
          <Pressable
            style={[styles.modalSheet, { backgroundColor: t.surface }]}
            onPress={() => {}}
          >
            <View style={[styles.modalHandle, { backgroundColor: t.border }]} />
            <Text style={[styles.modalTitle, { color: t.text }]}>
              Select Wilaya
            </Text>
            <View
              style={[
                styles.searchWrap,
                { backgroundColor: t.bgMuted, borderColor: t.border },
              ]}
            >
              <Ionicons name="search-outline" size={16} color={t.textSubtle} />
              <TextInput
                style={[styles.searchInput, { color: t.text }]}
                value={wilayaSearch}
                onChangeText={setWilayaSearch}
                placeholder="Search wilayas..."
                placeholderTextColor={t.textSubtle}
                autoCapitalize="none"
              />
              {wilayaSearch.length > 0 && (
                <Pressable onPress={() => setWilayaSearch('')}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={t.textSubtle}
                  />
                </Pressable>
              )}
            </View>
            <ScrollView style={styles.modalList}>
              {filteredWilayas.map((w) => {
                const selected = w === wilaya
                return (
                  <Pressable
                    key={w}
                    onPress={() => {
                      setWilaya(w)
                      setShowWilayaPicker(false)
                      setWilayaSearch('')
                    }}
                    style={({ pressed }) => [
                      styles.wilayaRow,
                      selected && {
                        backgroundColor: C.blue + '10',
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.wilayaText,
                        {
                          color: selected ? C.blue : t.text,
                          fontWeight: selected ? '600' : '400',
                        },
                      ]}
                    >
                      {w}
                    </Text>
                    {selected && (
                      <View
                        style={[
                          styles.wilayaCheck,
                          { backgroundColor: C.blue },
                        ]}
                      >
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                )
              })}
              {filteredWilayas.length === 0 && (
                <Text style={[styles.wilayaEmpty, { color: t.textSubtle }]}>
                  No wilayas match "{wilayaSearch}"
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: svBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: svOpacity,
                transform: [{ scale: svScale }, { translateY: svSlide }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.overlayCheckWrap,
                {
                  backgroundColor: C.green + '12',
                  borderColor: C.green + '25',
                },
                { transform: [{ scale: svCheck }] },
              ]}
            >
              <Ionicons name="checkmark-circle" size={48} color={C.green} />
            </Animated.View>
            <View
              style={[styles.overlayAccent, { backgroundColor: C.green }]}
            />
            <Text style={[styles.overlayTitle, { color: t.text }]}>Done</Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {successMessage}
            </Text>
            <Pressable
              onPress={() => setShowSuccess(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.green },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
              <Text style={styles.overlayBtnText}>Done</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {/* Error Overlay */}
      {showError && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowError(false)}
          />
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.overlayCheckWrap,
                { backgroundColor: C.red + '12', borderColor: C.red + '25' },
              ]}
            >
              <Ionicons name="alert-circle" size={48} color={C.red} />
            </View>
            <View style={[styles.overlayAccent, { backgroundColor: C.red }]} />
            <Text style={[styles.overlayTitle, { color: t.text }]}>Error</Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {errorMessage}
            </Text>
            <Pressable
              onPress={() => setShowError(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.red },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.overlayBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Info Overlay */}
      {showInfo && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowInfo(false)}
          />
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.overlayCheckWrap,
                {
                  backgroundColor: C.amber + '12',
                  borderColor: C.amber + '25',
                },
              ]}
            >
              <Ionicons name="information-circle" size={48} color={C.amber} />
            </View>
            <View
              style={[styles.overlayAccent, { backgroundColor: C.amber }]}
            />
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              {infoTitle}
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {infoMessage}
            </Text>
            <Pressable
              onPress={() => setShowInfo(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.amber },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.overlayBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Deactivate Confirm Overlay */}
      {showDeactivateConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: cfBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: cfOpacity,
                transform: [{ scale: cfScale }],
              },
            ]}
          >
            <View
              style={[
                styles.overlayCheckWrap,
                {
                  backgroundColor: C.amber + '12',
                  borderColor: C.amber + '25',
                },
              ]}
            >
              <Ionicons name="warning-outline" size={44} color={C.amber} />
            </View>
            <View
              style={[styles.overlayAccent, { backgroundColor: C.amber }]}
            />
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              Deactivate Account?
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              Your account will be deactivated. You can reactivate by logging in
              again.
            </Text>
            <View style={styles.overlayActions}>
              <Pressable
                onPress={() => setShowDeactivateConfirm(false)}
                style={({ pressed }) => [
                  styles.overlayCancel,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[styles.overlayCancelText, { color: t.textMuted }]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmDeactivate}
                style={({ pressed }) => [
                  styles.overlayConfirm,
                  { backgroundColor: C.amber },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.overlayConfirmText}>Deactivate</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Delete Confirm Overlay */}
      {showDeleteConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: cfBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: cfOpacity,
                transform: [{ scale: cfScale }],
              },
            ]}
          >
            <View
              style={[
                styles.overlayCheckWrap,
                { backgroundColor: C.red + '12', borderColor: C.red + '25' },
              ]}
            >
              <Ionicons name="trash-outline" size={44} color={C.red} />
            </View>
            <View style={[styles.overlayAccent, { backgroundColor: C.red }]} />
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              Delete Account?
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              This will permanently delete your account and all data. This
              action cannot be undone.
            </Text>
            <View style={styles.overlayActions}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={({ pressed }) => [
                  styles.overlayCancel,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[styles.overlayCancelText, { color: t.textMuted }]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={({ pressed }) => [
                  styles.overlayConfirm,
                  { backgroundColor: C.red },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.overlayConfirmText}>Delete</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable = true,
  focused,
  onFocus,
  onBlur,
  t,
}: {
  label: string
  value: string
  onChangeText?: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'phone-pad' | 'email-address'
  editable?: boolean
  focused: boolean
  onFocus?: () => void
  onBlur?: () => void
  t: any
}) {
  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: t.bgMuted,
          borderColor: focused ? C.blue + '50' : t.border,
        },
        !editable && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: t.textMuted }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { color: t.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.textSubtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize="none"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  )
}

const AVATAR_SIZE = 100

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  /* Scroll */
  scroll: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
  },
  avatarLoading: {
    position: 'absolute',
    top: AVATAR_SIZE / 2 - 10,
    left: AVATAR_SIZE / 2 - 10,
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  avatarBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Card */
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardBody: {
    gap: spacing.sm,
    padding: spacing.lg,
  },

  /* Field */
  field: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 52,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 2 : 0,
  },
  fieldValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 15,
    flex: 1,
  },

  /* Buttons */
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: 14,
    minHeight: 48,
    marginTop: spacing.xs,
  },
  fullBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 14,
    minHeight: 48,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  modalList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  wilayaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  wilayaText: {
    fontSize: 15,
  },
  wilayaCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wilayaEmpty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  /* Overlay shared */
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayCard: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    top: '28%',
    alignItems: 'center',
    paddingVertical: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayCheckWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  overlayAccent: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  overlayDesc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  overlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl + spacing.lg,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  overlayBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  overlayActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  overlayCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  overlayCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  overlayConfirm: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radius.md,
    minHeight: 48,
  },
  overlayConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
})

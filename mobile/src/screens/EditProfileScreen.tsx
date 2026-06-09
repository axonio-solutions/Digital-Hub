import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { ScrollView, Text, TextInput, View, useIsRTL } from 'expo-rtl'
import type { ScrollView as RNScrollView } from 'react-native'
import { Image } from 'expo-image'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { radius, spacing } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import {
  deactivateAccountFn,
  deleteAccountFn,
  fetchSession,
  updateProfileFn,
} from '../lib/api-client'
import { compressAndUpload } from '../lib/compress-image'
import type { SessionUser, UpdateProfileInput } from '../lib/api-client'

const C = {
  green: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  blue: '#2563EB',
} as const

interface EditProfileScreenProps {
  onSave?: (user: SessionUser) => void
  onCancel?: () => void
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

const profileSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  wilaya: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  storeName: z.string().optional(),
  companyAddress: z.string().optional(),
  commercialRegister: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const AVATAR_SIZE = 100

export function EditProfileScreen({
  onSave,
  onCancel,
}: EditProfileScreenProps) {
  const navigation = useNavigation()
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const styles = makeStyles(t, isRTL)
  const scrollRef = useRef<RNScrollView>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      whatsappNumber: user?.whatsappNumber || '',
      wilaya: user?.wilaya || '',
      city: user?.city || '',
      address: user?.address || '',
      storeName: user?.storeName || '',
      companyAddress: user?.companyAddress || '',
      commercialRegister: user?.commercialRegister || '',
    },
  })

  const [avatarUrl, setAvatarUrl] = useState(user?.image || '')

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

  const isSeller = user?.role === 'seller'

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

  if (!user) return null

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setInfoTitle(i18n('common.somethingWentWrong'))
      setInfoMessage(i18n('editProfile.changePhoto'))
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
      const publicUrl = await compressAndUpload(asset.uri, 'profiles')
      setAvatarUrl(publicUrl)
    } catch (err) {
      setErrorMessage(i18n('common.error'))
      setShowError(true)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage(i18n('editProfile.password'))
      setShowError(true)
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage(i18n('editProfile.password'))
      setShowError(true)
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(i18n('editProfile.password'))
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

      setSuccessMessage(i18n('editProfile.save'))
      setShowSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
    } catch (err: any) {
      setErrorMessage(err?.message || i18n('common.error'))
      setShowError(true)
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSave(data: ProfileForm) {
    if (!user) return
    setSaving(true)
    try {
      const updates: UpdateProfileInput = {
        name: data.name?.trim() || undefined,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        whatsappNumber: data.whatsappNumber?.trim() || undefined,
        wilaya: data.wilaya?.trim() || undefined,
        city: data.city?.trim() || undefined,
        address: data.address?.trim() || undefined,
        image: avatarUrl || undefined,
      }

      if (isSeller) {
        updates.storeName = data.storeName?.trim() || undefined
        updates.companyAddress = data.companyAddress?.trim() || undefined
        updates.commercialRegister =
          data.commercialRegister?.trim() || undefined
      }

      await updateProfileFn(user.id, updates)

      const fresh = await fetchSession()
      const localUpdated: NonNullable<typeof user> = {
        ...user,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.phoneNumber !== undefined && {
          phoneNumber: updates.phoneNumber,
        }),
        ...(updates.whatsappNumber !== undefined && {
          whatsappNumber: updates.whatsappNumber,
        }),
        ...(updates.wilaya !== undefined && { wilaya: updates.wilaya }),
        ...(updates.city !== undefined && { city: updates.city }),
        ...(updates.address !== undefined && { address: updates.address }),
        ...(updates.image !== undefined && { image: updates.image }),
        ...(updates.storeName !== undefined && {
          storeName: updates.storeName,
        }),
        ...(updates.companyAddress !== undefined && {
          companyAddress: updates.companyAddress,
        }),
        ...(updates.commercialRegister !== undefined && {
          commercialRegister: updates.commercialRegister,
        }),
      }
      const finalUser = fresh
        ? { ...fresh, image: fresh.image || localUpdated.image || null }
        : localUpdated
      setSuccessMessage(i18n('editProfile.save'))
      setShowSuccess(true)
      setTimeout(() => {
        setUser(finalUser)
        if (onSave) onSave(finalUser)
        else navigation.goBack()
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err?.message || i18n('common.error'))
      setShowError(true)
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivateConfirm() {
    setShowDeactivateConfirm(true)
  }

  async function confirmDeactivate() {
    if (!user) return
    setShowDeactivateConfirm(false)
    try {
      await deactivateAccountFn(user.id)
      setSuccessMessage(i18n('editProfile.deactivateAccount'))
      setShowSuccess(true)
    } catch {
      setErrorMessage(i18n('common.error'))
      setShowError(true)
    }
  }

  function handleDeleteConfirm() {
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!user) return
    setShowDeleteConfirm(false)
    try {
      await deleteAccountFn(user.id)
      setSuccessMessage(i18n('editProfile.deleteAccount'))
      setShowSuccess(true)
    } catch {
      setErrorMessage(i18n('common.error'))
      setShowError(true)
    }
  }

  function renderLocalField(
    name: keyof ProfileForm,
    label: string,
    opts: {
      placeholder?: string
      secureTextEntry?: boolean
      keyboardType?: 'default' | 'phone-pad' | 'email-address'
      editable?: boolean
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
    } = {},
  ) {
    const isFocused = focusedField === name
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={[
              styles.field,
              isFocused && { borderColor: C.blue + '50' },
              opts.editable === false && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.fieldInput}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={() => {
                onBlur()
                setFocusedField(null)
              }}
              onFocus={() => setFocusedField(name)}
              placeholder={opts.placeholder}
              placeholderTextColor={t.textSubtle}
              secureTextEntry={opts.secureTextEntry}
              keyboardType={opts.keyboardType}
              editable={opts.editable !== false}
              autoCapitalize={opts.autoCapitalize ?? 'none'}
            />
          </View>
        )}
      />
    )
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === 'ios'
                  ? 54
                  : (StatusBar.currentHeight ?? 28) + spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              onCancel?.() ?? navigation.goBack()
            }}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={20} color={t.textMuted} />
          </Pressable>
          <Text style={styles.headerTitle}>{i18n('editProfile.title')}</Text>
          <Pressable
            onPress={form.handleSubmit(handleSave)}
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
              <Text style={styles.saveText}>{i18n('editProfile.save')}</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
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
                {i18n('editProfile.changePhoto')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIcon, { backgroundColor: C.blue + '12' }]}
              >
                <Ionicons name="person-outline" size={14} color={C.blue} />
              </View>
              <Text style={styles.cardTitle}>{i18n('editProfile.name')}</Text>
            </View>
            <View style={styles.cardBody}>
              {renderLocalField('name', i18n('editProfile.name'), {
                placeholder: i18n('editProfile.name'),
                autoCapitalize: 'words',
              })}
              <View style={[styles.field, { opacity: 0.5 }]}>
                <Text style={styles.fieldLabel}>
                  {i18n('editProfile.email')}
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={user.email}
                  editable={false}
                  placeholderTextColor={t.textSubtle}
                />
              </View>
              {renderLocalField('phoneNumber', i18n('editProfile.phone'), {
                placeholder: i18n('editProfile.phone'),
                keyboardType: 'phone-pad',
              })}
              {renderLocalField('whatsappNumber', i18n('editProfile.phone'), {
                placeholder: i18n('editProfile.phone'),
                keyboardType: 'phone-pad',
              })}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIcon, { backgroundColor: C.blue + '12' }]}
              >
                <Ionicons name="location-outline" size={14} color={C.blue} />
              </View>
              <Text style={styles.cardTitle}>{i18n('editProfile.wilaya')}</Text>
            </View>
            <View style={styles.cardBody}>
              <Controller
                control={form.control}
                name="wilaya"
                render={({ field: { value } }) => (
                  <Pressable
                    onPress={() => {
                      setWilayaSearch('')
                      setShowWilayaPicker(true)
                    }}
                    style={({ pressed }) => [
                      styles.field,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.fieldLabel}>
                      {i18n('editProfile.wilaya')}
                    </Text>
                    <View style={styles.fieldValueRow}>
                      <Text
                        style={[
                          styles.fieldValue,
                          value ? { color: t.text } : { color: t.textSubtle },
                        ]}
                      >
                        {value || i18n('wilayaPicker.select')}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={t.textSubtle}
                      />
                    </View>
                  </Pressable>
                )}
              />
              {renderLocalField('city', i18n('editProfile.wilaya'), {
                placeholder: i18n('editProfile.wilaya'),
              })}
              {renderLocalField('address', i18n('editProfile.wilaya'), {
                placeholder: i18n('editProfile.wilaya'),
              })}
            </View>
          </View>

          {isSeller && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[styles.cardIcon, { backgroundColor: C.amber + '15' }]}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={C.amber}
                  />
                </View>
                <Text style={styles.cardTitle}>{i18n('editProfile.name')}</Text>
              </View>
              <View style={styles.cardBody}>
                {renderLocalField('storeName', i18n('editProfile.name'), {
                  placeholder: i18n('editProfile.name'),
                })}
                {renderLocalField('companyAddress', i18n('editProfile.name'), {
                  placeholder: i18n('editProfile.name'),
                })}
                {renderLocalField(
                  'commercialRegister',
                  i18n('editProfile.name'),
                  { placeholder: i18n('editProfile.name') },
                )}
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={({ pressed }) => [
                styles.cardHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
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
                <Text style={styles.cardTitle}>
                  {i18n('editProfile.password')}
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
                <View
                  style={[
                    styles.field,
                    focusedField === 'currentPassword' && {
                      borderColor: C.blue + '50',
                    },
                  ]}
                >
                  <Text style={styles.fieldLabel}>
                    {i18n('editProfile.password')}
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={i18n('editProfile.password')}
                    placeholderTextColor={t.textSubtle}
                    secureTextEntry
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('currentPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View
                  style={[
                    styles.field,
                    focusedField === 'newPassword' && {
                      borderColor: C.blue + '50',
                    },
                  ]}
                >
                  <Text style={styles.fieldLabel}>
                    {i18n('editProfile.password')}
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={i18n('editProfile.password')}
                    placeholderTextColor={t.textSubtle}
                    secureTextEntry
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View
                  style={[
                    styles.field,
                    focusedField === 'confirmPassword' && {
                      borderColor: C.blue + '50',
                    },
                  ]}
                >
                  <Text style={styles.fieldLabel}>
                    {i18n('editProfile.password')}
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={i18n('editProfile.password')}
                    placeholderTextColor={t.textSubtle}
                    secureTextEntry
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
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
                    <Text style={styles.fullBtnText}>
                      {i18n('editProfile.password')}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          <View style={[styles.card, styles.cardDanger]}>
            <View style={[styles.cardHeader, styles.cardHeaderDanger]}>
              <View style={[styles.cardIcon, styles.cardIconDanger]}>
                <Ionicons name="warning-outline" size={14} color={t.danger} />
              </View>
              <Text style={[styles.cardTitle, styles.cardTitleDanger]}>
                {i18n('editProfile.accountActions')}
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Pressable
                onPress={handleDeactivateConfirm}
                style={({ pressed }) => [
                  styles.dangerBtn,
                  styles.dangerBtnBorder,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={18}
                  color={t.danger}
                />
                <Text style={[styles.dangerBtnText, styles.dangerBtnTextColor]}>
                  {i18n('editProfile.deactivateAccount')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteConfirm}
                style={({ pressed }) => [
                  styles.dangerBtn,
                  styles.dangerBtnBorder,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={t.danger} />
                <Text style={[styles.dangerBtnText, styles.dangerBtnTextColor]}>
                  {i18n('editProfile.deleteAccount')}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{i18n('wilayaPicker.choose')}</Text>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={t.textSubtle} />
              <TextInput
                style={styles.searchInput}
                value={wilayaSearch}
                onChangeText={setWilayaSearch}
                placeholder={i18n('wilayaPicker.search')}
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
                const currentWilaya = form.watch('wilaya')
                const selected = w === currentWilaya
                return (
                  <Pressable
                    key={w}
                    onPress={() => {
                      form.setValue('wilaya', w, { shouldDirty: true })
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
                <Text style={styles.wilayaEmpty}>
                  {i18n('wilayaPicker.noMatch')}
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {showSuccess && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: svBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
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
            <Text style={styles.overlayTitle}>{i18n('common.done')}</Text>
            <Text style={styles.overlayDesc}>{successMessage}</Text>
            <Pressable
              onPress={() => setShowSuccess(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.green },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
              <Text style={styles.overlayBtnText}>{i18n('common.done')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {showError && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowError(false)}
          />
          <View style={styles.overlayCard}>
            <View
              style={[
                styles.overlayCheckWrap,
                { backgroundColor: C.red + '12', borderColor: C.red + '25' },
              ]}
            >
              <Ionicons name="alert-circle" size={48} color={C.red} />
            </View>
            <View style={[styles.overlayAccent, { backgroundColor: C.red }]} />
            <Text style={styles.overlayTitle}>{i18n('common.error')}</Text>
            <Text style={styles.overlayDesc}>{errorMessage}</Text>
            <Pressable
              onPress={() => setShowError(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.red },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.overlayBtnText}>{i18n('common.close')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showInfo && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowInfo(false)}
          />
          <View style={styles.overlayCard}>
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
            <Text style={styles.overlayTitle}>{infoTitle}</Text>
            <Text style={styles.overlayDesc}>{infoMessage}</Text>
            <Pressable
              onPress={() => setShowInfo(false)}
              style={({ pressed }) => [
                styles.overlayBtn,
                { backgroundColor: C.amber },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.overlayBtnText}>{i18n('common.close')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showDeactivateConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: cfBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
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
            <Text style={styles.overlayTitle}>
              {i18n('editProfile.confirm.title')}
            </Text>
            <Text style={styles.overlayDesc}>
              {i18n('editProfile.confirm.message')}
            </Text>
            <View style={styles.overlayActions}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={({ pressed }) => [
                  styles.overlayCancel,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.overlayCancelText}>
                  {i18n('common.cancel')}
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
                <Text style={styles.overlayConfirmText}>
                  {i18n('editProfile.deactivateAccount')}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {showDeleteConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.overlayBackdrop, { opacity: cfBackdrop }]}
          />
          <Animated.View
            style={[
              styles.overlayCard,
              {
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
            <Text style={styles.overlayTitle}>
              {i18n('editProfile.confirm.title')}
            </Text>
            <Text style={styles.overlayDesc}>
              {i18n('editProfile.confirm.message')}
            </Text>
            <View style={styles.overlayActions}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={({ pressed }) => [
                  styles.overlayCancel,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.overlayCancelText}>
                  {i18n('common.cancel')}
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
                <Text style={styles.overlayConfirmText}>
                  {i18n('editProfile.deleteAccount')}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

function makeStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bgMuted,
    },
    flex: {
      flex: 1,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
      backgroundColor: t.surface,
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
      backgroundColor: t.bgMuted,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: t.text,
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

    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },

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
      flexDirection: isRTL ? 'row-reverse' : 'row',
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

    card: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      backgroundColor: t.surface,
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
      borderBottomColor: t.border,
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
      color: t.text,
    },
    cardBody: {
      gap: spacing.sm,
      padding: spacing.lg,
    },

    field: {
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      minHeight: 52,
      justifyContent: 'center',
      backgroundColor: t.bgMuted,
      borderColor: t.border,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginBottom: 2,
      color: t.textMuted,
    },
    fieldInput: {
      fontSize: 15,
      paddingVertical: Platform.OS === 'ios' ? 2 : 0,
      color: t.text,
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

    fullBtn: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      flexDirection: isRTL ? 'row-reverse' : 'row',
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

    cardDanger: {
      backgroundColor: t.dangerBg,
      borderColor: t.danger + '30',
    },
    cardHeaderDanger: {
      borderBottomColor: t.danger + '20',
    },
    cardIconDanger: {
      backgroundColor: t.danger + '15',
    },
    cardTitleDanger: {
      color: t.danger,
    },
    dangerBtnBorder: {
      borderColor: t.danger + '30',
    },
    dangerBtnTextColor: {
      color: t.danger,
    },

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
      backgroundColor: t.surface,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: spacing.md,
      backgroundColor: t.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.sm,
      color: t.text,
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
      backgroundColor: t.bgMuted,
      borderColor: t.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 0,
      color: t.text,
    },
    modalList: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    wilayaRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      color: t.textSubtle,
    },

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
      borderColor: t.border,
      backgroundColor: t.surface,
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
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      borderColor: t.border,
      minHeight: 48,
    },
    overlayCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.textMuted,
    },
    overlayConfirm: {
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
}

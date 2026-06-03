import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native'
import { Text, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { compressAndUpload } from '../../lib/compress-image'
import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { RequestFormData } from '../NewRequestScreen'

export function PhotosStep() {
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const { watch, setValue } = useFormContext<RequestFormData>()
  const imageUrls = watch('imageUrls')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const pickImage = useCallback(
    async (useCamera: boolean) => {
      let ImagePicker: any
      try {
        ImagePicker = require('expo-image-picker')
      } catch {
        Alert.alert(
          translate('common.error'),
          translate('wizard.pickerNotAvailable'),
        )
        return
      }

      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        Alert.alert(
          translate('wizard.permissionNeeded'),
          useCamera
            ? translate('wizard.cameraPermissionRequired')
            : translate('wizard.libraryPermissionRequired'),
        )
        return
      }

      const launch = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync

      const result = await launch({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsMultipleSelection: !useCamera,
      })

      if (result.canceled) return

      const assets = result.assets || []
      setUploading(true)

      const newUrls: Array<string> = []

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        try {
          const publicUrl = await compressAndUpload(asset.uri, 'requests')
          newUrls.push(publicUrl)
          setProgress(Math.round(((i + 1) / assets.length) * 100))
        } catch (err: any) {
          if (__DEV__)
            console.log(
              '\n❌ photo upload error:',
              err?.message,
              JSON.stringify(err),
              '\n',
            )
          Alert.alert(
            translate('wizard.uploadFailed'),
            err?.message || translate('wizard.couldNotUpload'),
          )
        }
      }

      setValue('imageUrls', [...imageUrls, ...newUrls], { shouldDirty: true })
      setUploading(false)
      setProgress(0)
    },
    [imageUrls, setValue],
  )

  function removeImage(index: number) {
    const next = imageUrls.filter((_, i) => i !== index)
    setValue('imageUrls', next, { shouldDirty: true })
  }

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="camera-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          {translate('wizard.step.photos')}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        {translate('wizard.photosDescription')}
      </Text>

      {imageUrls.length > 0 && (
        <View style={styles.grid}>
          {imageUrls.map((url, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image
                source={{ uri: url }}
                style={styles.thumb}
                contentFit="cover"
              />
              <Pressable
                onPress={() => removeImage(i)}
                style={({ pressed }) => [
                  styles.removeBtn,
                  { backgroundColor: t.danger },
                  isRTL ? { left: 4 } : { right: 4 },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="trash-outline" size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {uploading && (
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            <ActivityIndicator size="small" color={t.primary} />
            <Text style={[styles.progressText, { color: t.textMuted }]}>
              {translate('wizard.uploading')} {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: t.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: t.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      <Pressable
        onPress={() => pickImage(true)}
        disabled={uploading}
        style={({ pressed }) => [
          styles.uploadBtn,
          {
            backgroundColor: t.primary,
            opacity: uploading ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="camera-outline" size={20} color={t.primaryFg} />
        <Text style={[styles.uploadBtnText, { color: t.primaryFg }]}>
          {translate('wizard.addPhoto')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => pickImage(false)}
        disabled={uploading}
        style={({ pressed }) => [
          styles.uploadBtn,
          styles.uploadBtnOutline,
          {
            borderColor: t.border,
            opacity: uploading ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="images-outline" size={20} color={t.text} />
        <Text style={[styles.uploadBtnText, { color: t.text }]}>
          {translate('wizard.chooseFromGallery')}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  step: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    marginTop: -spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbWrap: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  uploadBtnOutline: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  uploadBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
})

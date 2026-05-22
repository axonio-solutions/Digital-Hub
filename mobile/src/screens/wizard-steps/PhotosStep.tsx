import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

const BUCKET_NAME = 'requests-photos'

interface Props {
  imageUrls: Array<string>
  onChange: (urls: Array<string>) => void
}

export function PhotosStep({ imageUrls, onChange }: Props) {
  const t = useTheme()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const pickImage = useCallback(
    async (useCamera: boolean) => {
      let ImagePicker: any
      try {
        ImagePicker = require('expo-image-picker')
      } catch {
        Alert.alert('Error', 'Image picker is not available.')
        return
      }

      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          useCamera
            ? 'Camera access is required to take photos.'
            : 'Photo library access is required to upload images.',
        )
        return
      }

      const launch = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync

      const result = await launch({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: !useCamera,
      })

      if (result.canceled) return

      const assets = result.assets || []
      setUploading(true)

      const newUrls: Array<string> = []

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        try {
          const ext = asset.uri.split('.').pop() || 'jpg'
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
          const filePath = `temp/${fileName}`

          const formData = new FormData()
          formData.append('file', {
            uri: asset.uri,
            type: `image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'png' ? 'png' : 'jpeg'}`,
            name: fileName,
          } as any)

          const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
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
            const errText = await uploadRes.text().catch(() => '')
            console.log(JSON.stringify(errText))
            continue
          }

          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
          newUrls.push(publicUrl)
          setProgress(Math.round(((i + 1) / assets.length) * 100))
        } catch (err) {
          console.log(JSON.stringify(err))
        }
      }

      onChange([...imageUrls, ...newUrls])
      setUploading(false)
      setProgress(0)
    },
    [imageUrls, onChange],
  )

  function removeImage(index: number) {
    const next = imageUrls.filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="camera-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>Photos & Media</Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        Upload photos to help sellers identify the correct part.
      </Text>

      {imageUrls.length > 0 && (
        <View style={styles.grid}>
          {imageUrls.map((url, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image
                source={{ uri: url }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => removeImage(i)}
                style={({ pressed }) => [
                  styles.removeBtn,
                  { backgroundColor: t.danger },
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
              Uploading... {progress}%
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
          Take Photo
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
          Choose from Gallery
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
    right: 4,
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

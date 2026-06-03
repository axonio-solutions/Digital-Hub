import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

import { uploadImage } from './api-client'

export async function compressAndUpload(
  uri: string,
  folder: 'requests' | 'profiles',
): Promise<string> {
  if (__DEV__)
    console.log(`\n🖼 compressAndUpload: ${folder} uri=${uri.slice(0, 80)}\n`)

  const context = ImageManipulator.manipulate(uri)
  context.resize({ width: 1280 })
  const imageRef = await context.renderAsync()
  const result = await imageRef.saveAsync({
    compress: 0.82,
    format: SaveFormat.WEBP,
    base64: true,
  })

  if (__DEV__)
    console.log(`\n🖼 base64 length=${result.base64?.length ?? 'null'}\n`)

  if (!result.base64)
    throw new Error('Image compression returned no base64 data')

  return uploadImage(result.base64, folder)
}

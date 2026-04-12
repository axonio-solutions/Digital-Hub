import sharp from 'sharp'

export async function compressImageToWebP(
  buffer: Buffer,
  maxWidth: number = 1200
): Promise<{ buffer: Buffer; ext: string; mimeType: string }> {
  try {
    const compressedBuffer = await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside', // Maintains aspect ratio
      })
      .webp({ quality: 80 })
      .toBuffer()

    return {
      buffer: compressedBuffer,
      ext: '.webp',
      mimeType: 'image/webp',
    }
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

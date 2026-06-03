import { createServerFn } from '@tanstack/react-start'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { authMiddleware } from '@/features/auth/guards/auth'
import { R2_BUCKET, R2_PUBLIC_URL, r2 } from '@/lib/r2'

function nanoid(len: number) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { base64: string; folder: string })
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.base64, 'base64')
    const key = `${data.folder}/${Date.now()}-${nanoid(8)}.webp`

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
      }),
    )

    const baseUrl =
      R2_PUBLIC_URL || 'https://pub-2c0e06d8b4bd4dad9fba99227f84031b.r2.dev'
    return { publicUrl: `${baseUrl}/${key}` }
  })

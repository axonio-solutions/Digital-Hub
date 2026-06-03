/**
 * One-time setup: configures CORS on the R2 bucket via the Cloudflare REST API.
 *
 * Requires CF_API_TOKEN in .env — create one at:
 *   dash.cloudflare.com → My Profile → API Tokens → Create Token
 *   with permission: Cloudflare R2 Storage → Edit
 *
 * Run once:  pnpm tsx scripts/setup-r2-cors.ts
 *
 * Alternative: set CORS manually in the Cloudflare dashboard:
 *   R2 → mlila-images → Settings → CORS Policy → Add rule:
 *   AllowedOrigins: ["*"]
 *   AllowedMethods: ["GET","PUT","HEAD"]
 *   AllowedHeaders: ["Content-Type","Content-Length"]
 *   MaxAgeSeconds: 3600
 */

import 'dotenv/config'

const accountId = process.env.R2_ACCOUNT_ID!
const bucketName = process.env.R2_BUCKET_NAME!
const apiToken = process.env.CF_API_TOKEN

if (!apiToken) {
  console.error(
    'CF_API_TOKEN not set in .env.\n' +
      'Create one at dash.cloudflare.com → My Profile → API Tokens\n' +
      'with permission: Cloudflare R2 Storage → Edit\n\n' +
      'Or configure CORS manually in the dashboard:\n' +
      `  https://dash.cloudflare.com/${accountId}/r2/default/buckets/${bucketName}/settings`,
  )
  process.exit(1)
}

const corsRules = [
  {
    allowed_origins: ['*'],
    allowed_methods: ['GET', 'PUT', 'HEAD'],
    allowed_headers: ['Content-Type', 'Content-Length'],
    max_age_seconds: 3600,
  },
]

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`,
  {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corsRules),
  },
)

const body = await res.json()

if (!res.ok) {
  console.error('Failed:', JSON.stringify(body, null, 2))
  process.exit(1)
}

console.log(`✓ CORS configured on R2 bucket: ${bucketName}`)

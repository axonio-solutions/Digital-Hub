import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/\/$/, '')

  if (path.endsWith('/register')) {
    return handleRegister(req)
  }

  return handleWebhook(req)
})

async function handleRegister(req: Request) {
  const apikey = req.headers.get('apikey')
  if (!apikey || apikey !== ANON_KEY) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { userId, token, platform } = await req.json()

    if (!userId || !token || !platform) {
      return json(
        { error: 'Missing required fields: userId, token, platform' },
        400,
      )
    }
    if (!['ios', 'android'].includes(platform)) {
      return json({ error: 'Platform must be ios or android' }, 400)
    }

    const { error } = await supabase
      .from('device_tokens')
      .upsert({ user_id: userId, token, platform }, { onConflict: 'token' })

    if (error) {
      console.error('upsert error:', error.message)
      return json({ error: error.message }, 500)
    }

    return json({ success: true })
  } catch (e) {
    console.error('register error:', e)
    return json({ error: String(e) }, 500)
  }
}

async function handleWebhook(req: Request) {
  try {
    const record = await req.json()
    if (!record.user_id || !record.title) {
      return json({ error: 'Invalid payload' }, 400)
    }

    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', record.user_id)

    if (error) {
      console.error('query error:', error.message)
      return json({ error: error.message }, 500)
    }

    if (!tokens || tokens.length === 0) {
      return json({ sent: 0 })
    }

    const requestId = record.metadata?.requestId || record.reference_id
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: 'default',
      title: record.title,
      body: record.message,
      priority: 'high' as const,
      ...(requestId ? { data: { requestId } } : {}),
    }))

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await pushRes.json()
    if (!pushRes.ok) {
      console.error('Expo push error:', JSON.stringify(result))
      return json({ error: 'Expo API error', details: result }, 502)
    }

    console.log(
      `Push sent to ${tokens.length} device(s) for user ${record.user_id}`,
    )
    return json({ sent: tokens.length })
  } catch (e) {
    console.error('webhook error:', e)
    return json({ error: 'Internal error' }, 500)
  }
}

import { eq } from 'drizzle-orm'
import type { User } from '@/lib/auth'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema/auth'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}

export function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401)
}

export function forbidden(): Response {
  return json({ error: 'Forbidden' }, 403)
}

export function badRequest(message = 'Bad Request'): Response {
  return json({ error: message }, 400)
}

export function notFound(message = 'Not Found'): Response {
  return json({ error: message }, 404)
}

export function internalError(message = 'Internal Server Error'): Response {
  return json({ error: message }, 500)
}

export async function getSessionUser(request: Request): Promise<User | null> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return null

  const [freshUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!freshUser) return null
  return { ...session.user, ...freshUser } as User
}

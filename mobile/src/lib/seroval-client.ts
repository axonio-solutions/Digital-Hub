import { fromCrossJSON, toJSONAsync } from 'seroval'

export type { SerovalNode } from 'seroval'

export async function serializeRequestPayload(
  payload: unknown,
): Promise<string> {
  const payloadToSerialize: Record<string, unknown> = {}
  if (payload !== undefined) {
    payloadToSerialize['data'] = payload
  }
  const tree = await toJSONAsync(payloadToSerialize)
  return JSON.stringify(tree)
}

/**
 * Walk a raw seroval Cross-mode node tree for basic JSON types.
 * This is a last-resort fallback when fromCrossJSON fails in environments
 * where the seroval CJS bundle has issues (Hermes, Metro, etc.).
 *
 * Cross-mode type codes:
 *   t=0 — number  (s = numeric value)
 *   t=1 — string  (s = string value)
 *   t=2 — special (s: 0=null, 1=undefined, 2=true, 3=false)
 *   t=9 — array   (a = child nodes, o = prototype override)
 *   t=10 — object (p.k = keys, p.v = child nodes, o = prototype override)
 */
function walkSerovalNode(node: any): any {
  if (!node || typeof node !== 'object') return node
  const { t, s, p, a } = node

  switch (t) {
    case 0:
      return Number(s) // number
    case 1:
      return String(s) // string
    case 2: // special
      if (s === 0) return null
      if (s === 1) return undefined
      if (s === 2) return true
      if (s === 3) return false
      return null // NaN etc → null
    case 9: {
      // array
      const arr: Array<any> = []
      if (Array.isArray(a)) {
        for (let i = 0; i < a.length; i++) {
          arr.push(walkSerovalNode(a[i]))
        }
      }
      return arr
    }
    case 10: {
      // object
      const obj: Record<string, any> = {}
      if (p && Array.isArray(p.k) && Array.isArray(p.v)) {
        for (let i = 0; i < p.k.length; i++) {
          obj[p.k[i]] = walkSerovalNode(p.v[i])
        }
      }
      return obj
    }
    default:
      return node
  }
}

/**
 * Check if a value looks like a seroval Cross-mode node tree
 * (has the key `t` for type and `i` for id).
 */
function isSerovalNode(value: any): boolean {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.t === 'number' &&
    'i' in value
  )
}

export function deserializeResponse<T>(rawText: string): T {
  if (!rawText) {
    throw new Error('Empty response body')
  }

  // Try as JSON seroval first (standard path)
  try {
    const json = JSON.parse(rawText)
    return fromCrossJSON(json, { plugins: [] })
  } catch (e) {
    console.warn('[seroval] fromCrossJSON failed:', e)
  }

  // Try as NDJSON: parse first non-empty line
  const firstLine = rawText.split('\n').find((l) => l.trim().length > 0)
  if (firstLine) {
    try {
      const json = JSON.parse(firstLine)
      return fromCrossJSON(json, { plugins: [] })
    } catch (e) {
      console.warn('[seroval] fromCrossJSON (NDJSON) failed:', e)
    }
  }

  // Fallback: manual seroval tree walker (handles Hermes/Metro edge cases)
  try {
    const json = JSON.parse(rawText)
    if (isSerovalNode(json)) {
      const result = walkSerovalNode(json)
      console.log(
        '[seroval] manual walk succeeded, keys:',
        typeof result === 'object'
          ? Object.keys(result).slice(0, 8)
          : typeof result,
      )
      return result as T
    }
  } catch {
    // ignore
  }

  // Final fallback: treat as plain JSON
  return JSON.parse(rawText) as T
}

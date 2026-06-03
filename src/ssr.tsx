import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

import { createRouter } from './router'

const safeHandler = (
  opts: Parameters<typeof defaultStreamHandler>[0],
) => {
  try {
    return defaultStreamHandler(opts)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return new Response(null, { status: 499 })
    }
    throw err
  }
}

export default (createStartHandler as any)({
  getRouterManifest,
})((safeHandler as any)(createRouter))

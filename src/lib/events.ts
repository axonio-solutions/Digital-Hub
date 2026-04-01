import { EventEmitter } from 'events'

// Global event emitter for server-side events (SSE relay)
// Using globalThis to maintain a single instance across Hot Module Replacement in dev
const globalForEvents = globalThis as unknown as {
  notificationEvents: EventEmitter | undefined
}

export const notificationEvents = 
  globalForEvents.notificationEvents ?? new EventEmitter()

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.notificationEvents = notificationEvents
  // Increase listeners limit to avoid warnings under heavy load
  notificationEvents.setMaxListeners(100)
}

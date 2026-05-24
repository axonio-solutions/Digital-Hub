import { createFileRoute } from '@tanstack/react-router'
import { OfflinePage } from './components/errors/offline-page'

export const Route = createFileRoute('/offline')({
  component: OfflinePage,
})

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/listings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello /admin/listings!</div>
}

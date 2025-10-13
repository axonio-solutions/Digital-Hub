import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/dashboad')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello /client/dashboad </div>
}

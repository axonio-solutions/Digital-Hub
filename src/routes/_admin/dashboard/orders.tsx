import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/dashboard/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return  (<div>Hello "/admin/orders"!</div>)
            
  
}

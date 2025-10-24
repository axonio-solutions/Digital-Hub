import ListingsTable from '@/features/listings/listings-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/dashboard/listings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ListingsTable/>
         
}
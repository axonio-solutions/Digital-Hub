import { createFileRoute, redirect } from '@tanstack/react-router'
import { TaxonomyHub } from '@/features/taxonomy/components/taxonomy-hub'

export const Route = createFileRoute('/_authed/dashboard/admin/categories')({
  beforeLoad: ({ context }: any) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: CategoryManagementRoute,
})

function CategoryManagementRoute() {
  return <TaxonomyHub />
}

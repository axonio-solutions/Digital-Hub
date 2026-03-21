import { createFileRoute } from '@tanstack/react-router'
import { RequestsHub } from '@/features/requests/components/requests-hub'

export const Route = createFileRoute('/_authed/dashboard/requests/')({
    component: RequestsHubRoute,
})

function RequestsHubRoute() {
    return <RequestsHub />
}

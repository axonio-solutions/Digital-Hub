import { createFileRoute } from '@tanstack/react-router'
import { SettingsHub } from '@/features/accounts/components/settings-hub'

export const Route = createFileRoute('/_authed/dashboard/profile/')({
    component: ProfilePageRoute,
})

function ProfilePageRoute() {
    return <SettingsHub />
}

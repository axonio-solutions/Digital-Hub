import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"

export const requestStatuses = [
    {
        label: "Active",
        value: "open",
        icon: CheckCircle2,
    },
    {
        label: "Closed",
        value: "closed",
        icon: Circle,
    },
    {
        label: "Pending",
        value: "pending",
        icon: Clock,
    },
    {
        label: "Expired",
        value: "expired",
        icon: AlertCircle,
    },
]

// Brands will be dynamically generated in the component from the data

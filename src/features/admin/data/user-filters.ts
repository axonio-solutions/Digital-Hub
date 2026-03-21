import { Shield, ShieldOff, User, ShoppingBag, Lock } from "lucide-react"

export const roles = [
    {
        label: "Admin",
        value: "admin",
        icon: Lock,
    },
    {
        label: "Seller",
        value: "seller",
        icon: ShoppingBag,
    },
    {
        label: "Buyer",
        value: "buyer",
        icon: User,
    },
]

export const integrityStatuses = [
    {
        label: "Secure",
        value: "false", // false for banned means secure
        icon: Shield,
    },
    {
        label: "Compromised",
        value: "true", // true for banned means compromised
        icon: ShieldOff,
    },
]

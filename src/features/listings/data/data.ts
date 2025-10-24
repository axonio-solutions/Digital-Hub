import { CheckCircle, Circle, CircleOff, HelpCircle, Timer, MonitorSmartphone, Gamepad2, Music, Video } from "lucide-react"

export const categories = [
  { value: "account", label: "Account", icon: MonitorSmartphone },
  { value: "software", label: "Software", icon: CheckCircle },
  { value: "music", label: "Music", icon: Music },
  { value: "video", label: "Video", icon: Video },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
]

export const statuses = [
  { value: "available", label: "Available", icon: CheckCircle },
  { value: "sold", label: "Sold", icon: CircleOff },
  { value: "reserved", label: "Reserved", icon: Timer },
  { value: "pending", label: "Pending", icon: HelpCircle },
]

export const platforms = [
  { value: "steam", label: "Steam" },
  { value: "spotify", label: "Spotify" },
  { value: "netflix", label: "Netflix" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "adobe", label: "Adobe" },
  { value: "microsoft", label: "Microsoft" },
  { value: "epicgames", label: "Epic Games" },
]

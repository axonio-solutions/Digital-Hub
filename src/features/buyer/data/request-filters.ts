import { CheckCircle2, Circle, XCircle, PencilLine } from 'lucide-react'

export const requestStatuses = [
  {
    label: 'Draft',
    value: 'draft',
    icon: PencilLine,
  },
  {
    label: 'Open',
    value: 'open',
    icon: Circle,
  },
  {
    label: 'Fulfilled',
    value: 'fulfilled',
    icon: CheckCircle2,
  },
  {
    label: 'Cancelled',
    value: 'cancelled',
    icon: XCircle,
  },
]

// Brands will be dynamically generated in the component from the data

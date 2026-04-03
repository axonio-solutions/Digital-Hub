import { Activity, CheckCircle, Lock, Shield, ShieldOff, ShoppingBag, User } from 'lucide-react'
import { TFunction } from 'i18next'

export const getRoles = (t: TFunction) => [
  {
    label: t('users.roles.admin'),
    value: 'admin',
    icon: Lock,
  },
  {
    label: t('users.roles.seller'),
    value: 'seller',
    icon: ShoppingBag,
  },
  {
    label: t('users.roles.buyer'),
    value: 'buyer',
    icon: User,
  },
]

export const getIntegrityStatuses = (t: TFunction) => [
  {
    label: t('users.integrity.secure'),
    value: 'false',
    icon: Shield,
  },
  {
    label: t('users.integrity.compromised'),
    value: 'true',
    icon: ShieldOff,
  },
]

export const getAccountStatuses = (t: TFunction) => [
  {
    label: t('users.status.new'),
    value: 'new',
    icon: User,
  },
  {
    label: t('users.status.waitlisted'),
    value: 'waitlisted',
    icon: Activity,
  },
  {
    label: t('users.status.active'),
    value: 'active',
    icon: CheckCircle,
  },
]

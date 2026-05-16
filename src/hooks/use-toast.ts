import { useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'
import { useTranslation } from 'react-i18next'

type ToastAction = {
  label: string
  onClick: () => void
}

type ToastOptions = {
  description?: string
  duration?: number
  action?: ToastAction
}

type ErrorToastOptions = Omit<ToastOptions, 'action'> & {
  error?: string
}

function resolveLabel(labelOrKey: string, t: (key: string) => string): string {
  return labelOrKey.startsWith('toasts.') || labelOrKey.includes('.')
    ? t(labelOrKey)
    : labelOrKey
}

export function useToast(namespace?: string) {
  const { t } = useTranslation(namespace)

  const success = useCallback(
    (key: string, options?: ToastOptions) => {
      sonnerToast.success(t(key), {
        description: options?.description ? resolveLabel(options.description, t) : undefined,
        duration: options?.duration ?? 4000,
        action: options?.action
          ? {
              label: resolveLabel(options.action.label, t),
              onClick: options.action.onClick,
            }
          : undefined,
      })
    },
    [t],
  )

  const error = useCallback(
    (key: string, options?: ErrorToastOptions) => {
      sonnerToast.error(t(key), {
        description: options?.error ?? (options?.description ? resolveLabel(options.description, t) : undefined),
        duration: options?.duration ?? 5000,
      })
    },
    [t],
  )

  const info = useCallback(
    (key: string, options?: ToastOptions) => {
      sonnerToast.info(t(key), {
        description: options?.description ? resolveLabel(options.description, t) : undefined,
        duration: options?.duration ?? 4000,
        action: options?.action
          ? {
              label: resolveLabel(options.action.label, t),
              onClick: options.action.onClick,
            }
          : undefined,
      })
    },
    [t],
  )

  const warning = useCallback(
    (key: string, options?: ToastOptions) => {
      sonnerToast.warning(t(key), {
        description: options?.description ? resolveLabel(options.description, t) : undefined,
        duration: options?.duration ?? 4000,
        action: options?.action
          ? {
              label: resolveLabel(options.action.label, t),
              onClick: options.action.onClick,
            }
          : undefined,
      })
    },
    [t],
  )

  return { toast: { success, error, info, warning } }
}

export type { ToastOptions, ErrorToastOptions }

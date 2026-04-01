import type { z } from 'zod'

import type { loginSchema } from './schemas'

export type LoginFormData = z.infer<typeof loginSchema>

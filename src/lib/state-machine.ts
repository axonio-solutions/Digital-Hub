export class InvalidStateTransitionError extends Error {
  constructor(entity: string, current: string, target: string) {
    super(`Cannot transition ${entity} from '${current}' to '${target}'`)
    this.name = 'InvalidStateTransitionError'
  }
}

const allowedRequestTransitions: Record<string, Array<string> | undefined> = {
  open: ['cancelled', 'fulfilled'],
  cancelled: ['open'],
  fulfilled: [],
}

const allowedQuoteTransitions: Record<string, Array<string> | undefined> = {
  pending: ['accepted', 'rejected'],
  accepted: ['pending', 'rejected'],
  rejected: ['pending'],
}

export function validateRequestTransition(
  current: string,
  target: string,
): void {
  const allowed = allowedRequestTransitions[current]
  if (!allowed?.includes(target)) {
    throw new InvalidStateTransitionError('request', current, target)
  }
}

export function validateQuoteTransition(current: string, target: string): void {
  const allowed = allowedQuoteTransitions[current]
  if (!allowed?.includes(target)) {
    throw new InvalidStateTransitionError('quote', current, target)
  }
}

export function canDeleteRequest(status: string): boolean {
  return ['open', 'cancelled'].includes(status)
}

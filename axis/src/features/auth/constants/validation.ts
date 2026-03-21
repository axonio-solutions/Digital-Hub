export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 72,
  REGEX: {
    NUMBERS: /\d/,
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  },
} as const;

export const NAME_REQUIREMENTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
} as const;

export const PHONE_REQUIREMENTS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 15,
  REGEX: /^\+?[1-9]\d{1,14}$/,
} as const;

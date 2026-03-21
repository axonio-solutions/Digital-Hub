export const USER_ROLES = {
  CUSTOMER: "customer",
  CAFE_OWNER: "cafe_owner",
  ADMIN: "admin",
} as const;

export const AUTH_ROUTES = {
	LOGIN: "/login",
	REGISTER: "/register",
	FORGOT_PASSWORD: "/forgot-password",
	RESET_PASSWORD: "/reset-password",
	VERIFY_EMAIL: "/verify-email",
	DASHBOARD: "/dashboard",
	COMPLETE_REGISTRATION: "/complete-registration",
} as const;

export const SOCIAL_PROVIDERS = {
  GOOGLE: "google",
} as const;

export const UI_CONFIG = {
  INPUT_MAX_LENGTH: 255,
  FORM_VALIDATION_MODE: "onBlur" as const,
} as const;

export const AUTH_COOKIE_NAME = "axis-auth";

export const USER_ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  HOME: "/",
  COMPLETE_REGISTRATION: "/complete-registration",
} as const;


export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

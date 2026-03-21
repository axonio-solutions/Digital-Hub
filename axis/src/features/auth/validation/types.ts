import type { USER_ROLES } from "../constants/config";
import type { z } from "zod";
import type { createValidationSchemas } from "./schemas";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type LoginMethod = "email" | "phone";

type ValidationSchemas = ReturnType<typeof createValidationSchemas>;

export type EmailLoginFormData = z.infer<ValidationSchemas["emailLoginSchema"]>;

export type PhoneLoginFormData = z.infer<ValidationSchemas["phoneLoginSchema"]>;

export type RegistrationFormData = z.infer<
  ValidationSchemas["registrationSchema"]
>;

export type ForgotPasswordFormData = z.infer<
  ValidationSchemas["forgotPasswordSchema"]
>;

export type ResetPasswordFormData = z.infer<
  ValidationSchemas["resetPasswordSchema"]
>;

export type CompleteRegistrationFormData = z.infer<
  ValidationSchemas["completeRegistrationSchema"]
>;

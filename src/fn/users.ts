import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";

/**
 * Axis Layer 3: User/Account Actions
 */

export const updateProfileServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { updateProfileUseCase } = await import("@/use-cases/accounts/index");
    return await updateProfileUseCase(data.userId, data.updates || data);
  });

export const deactivateAccountServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { deactivateAccountUseCase } = await import("@/use-cases/accounts/index");
    return await deactivateAccountUseCase(data.userId);
  });

export const deleteAccountServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const { deleteAccountUseCase } = await import("@/use-cases/accounts/index");
    return await deleteAccountUseCase(data.userId);
  });

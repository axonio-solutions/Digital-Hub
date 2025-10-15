import { auth } from "@/lib/auth";
import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({
  method: "POST",
  response: "raw",
  // ✅ Add your validator here
  validator: (data: { email: string; password: string }) => data,
})
  .handler(async ({ data }) => {
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      asResponse: true,
    });

    return response;
  });

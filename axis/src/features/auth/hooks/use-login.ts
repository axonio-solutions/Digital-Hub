import { loginFn } from "@/fn/auth";
import { useMutation } from "@/hooks/use-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_ROUTES } from "../constants/config";
import { createValidationSchemas } from "../validation";
import type {
	EmailLoginFormData,
	PhoneLoginFormData,
} from "../validation/types";

interface UseLoginOptions {
	onOTPSent?: () => void;
}

const mockSignInWithOTP = async (data: PhoneLoginFormData) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	if (data.phone.includes("999")) {
		return { success: false, error: "Failed to send OTP" };
	}
	return { success: true };
};

export function useLogin(options?: UseLoginOptions) {
	const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
	const { loginSchema } = createValidationSchemas();
	const router = useRouter();

	const loginMutation = useMutation({
		fn: loginFn,
		onSuccess: async (ctx) => {
			if (ctx.data?.token) {
				await router.invalidate();
				return router.navigate({ to: AUTH_ROUTES.DASHBOARD });
			}
		},
		onFailure: ({ error }) => {
			toast.error(error.message);
		},
	});

	const form = useForm<EmailLoginFormData | PhoneLoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues:
			loginMethod === "email" ? { email: "", password: "" } : { phone: "" },
	});

	const onSubmit: SubmitHandler<
		EmailLoginFormData | PhoneLoginFormData
	> = async (data) => {
		if (loginMethod === "email") {
			loginMutation.mutate({
				data: {
					email: (data as EmailLoginFormData).email,
					password: (data as EmailLoginFormData).password,
				},
			});
		} else {
			const result = await mockSignInWithOTP(data as PhoneLoginFormData);
			if (!result.success) {
				toast.error(result.error || "Failed to send OTP");
				return;
			}
			toast.success("OTP sent successfully");
			form.reset();
			options?.onOTPSent?.();
		}
	};

	return {
		form,
		loginMethod,
		setLoginMethod,
		isPending: loginMutation.status === "pending",
		onSubmit,
		loginError: loginMutation.data?.error,
		loginMessage: loginMutation.data?.message,
	} as const;
}

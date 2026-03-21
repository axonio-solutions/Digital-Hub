import { forgotPasswordFn } from "@/fn/auth";
import { useMutation } from "@/hooks/use-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createValidationSchemas } from "../validation";
import type { ForgotPasswordFormData } from "../validation/types";

export function useForgotPassword() {
	const { forgotPasswordSchema } = createValidationSchemas();

	const forgotPasswordMutation = useMutation({
		fn: forgotPasswordFn,
		onSuccess: async (ctx) => {
			if (ctx.data?.success) {
				toast.success(
					"تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
				);
				form.reset();
			}
		},
		onFailure(ctx) {
			toast.error(
				ctx.error.message ||
					"فشل اعادة تعيين كلمة المرور. يرجى المحاولة مرة اخرى.",
			);
		},
	});

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		forgotPasswordMutation.mutate({
			data,
		});
	};

	return {
		form,
		isPending: forgotPasswordMutation.status === "pending",
		onSubmit,
	} as const;
}

import { resetPasswordFn } from "@/fn/auth";
import { useMutation } from "@/hooks/use-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_ROUTES } from "../constants/config";
import { createValidationSchemas } from "../validation";
import type { ResetPasswordFormData } from "../validation/types";

export function useResetPassword() {
	const navigate = useNavigate({ from: AUTH_ROUTES.RESET_PASSWORD });
	const { resetPasswordSchema } = createValidationSchemas();
	const search = useSearch({
		from: "/(authentication)/reset-password",
	});
	const token = search.token;

	const resetPasswordMutation = useMutation({
		fn: resetPasswordFn,
		onSuccess: async (ctx) => {
			if (ctx.data.success) {
				toast.success("تم إعادة تعيين كلمة المرور بنجاح.");
				form.reset();
				return navigate({
					to: AUTH_ROUTES.DASHBOARD,
				});
			}
			toast.error("فشل اعادة تعيين كلمة المرور. يرجى المحاولة مرة اخرى.");
		},
	});

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) {
			toast.error("رمز التحقق غير موجود. الرجاء إعادة المحاولة.");
			return;
		}

		resetPasswordMutation.mutate({
			data: {
				...data,
				token, // إضافة الـ token إلى البيانات المرسلة
			},
		});
	};

	return {
		form,
		isPending: resetPasswordMutation.status === "pending",
		onSubmit,
	} as const;
}

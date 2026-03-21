import { completeRegistrationFn } from "@/fn/auth";
import { useMutation } from "@/hooks/use-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_ROUTES } from "../constants/config";
import { authQueries } from "../queries/auth-queries";
import { createValidationSchemas } from "../validation";
import type { CompleteRegistrationFormData } from "../validation/types";

export function useCompleteRegistration() {
	const { completeRegistrationSchema } = createValidationSchemas();
	const router = useRouter();
  const queryClient = useQueryClient();

	const form = useForm<CompleteRegistrationFormData>({
		resolver: zodResolver(completeRegistrationSchema),
		defaultValues: {
			role: "customer",
			phone: "",
		},
	});

	const role = form.watch("role");
	const description =
		role === "cafe_owner"
			? "ابدأ إدارة مقهاك للوصول إلى عشاق القهوة"
			: "انضم لاكتشاف أفضل أماكن القهوة وحفظها";

	const completeRegistrationMutation = useMutation({
		fn: completeRegistrationFn,
		onSuccess: (ctx) => {
			const userWithFreshData = ctx.data.user;
			toast.success("Registration complete!");
			if (ctx.data?.success) {
				queryClient.setQueryData(
					authQueries.user().queryKey,
					userWithFreshData,
				);
				router.invalidate();
				router.navigate({ to: AUTH_ROUTES.DASHBOARD });
			}
		},
		onFailure: (ctx) => {
			toast.error(ctx.error.message || "Could not complete registration");
		},
	});

	const onSubmit: SubmitHandler<CompleteRegistrationFormData> = async (
		data,
	) => {
		completeRegistrationMutation.mutate({
			data: {
				role: data.role,
				phone: data.phone,
			},
		});
	};

	return {
		form,
		isPending: completeRegistrationMutation.status === "pending",
		onSubmit,
		description,
	} as const;
}

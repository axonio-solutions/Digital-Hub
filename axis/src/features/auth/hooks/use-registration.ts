import { zodResolver } from "@hookform/resolvers/zod";
import {  useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegistrationContext } from "../components/registration-provider";
import {
	
	createValidationSchemas
} from "../validation";
import type {SubmitHandler} from "react-hook-form";
import type {RegistrationFormData} from "../validation";
import { useMutation } from "@/hooks/use-mutation";
import { registerFn } from "@/fn/auth";

export function useRegistration() {
	const { registrationSchema } = createValidationSchemas();
	const { setSuccess } = useRegistrationContext();

	const registrationMutation = useMutation({
		fn: registerFn,
		onSuccess: async (ctx) => {
			if (!ctx.data?.error) {
				toast.success("يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.");
				setSuccess(true);
				form.reset();
				return;
			}
			toast.error(ctx.data.error || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
		},
	});

	const form = useForm<RegistrationFormData>({
		resolver: zodResolver(registrationSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			fullName: "",
			phone: "",
			role: "customer",
			acceptTerms: false,
		},
	});

	const onSubmit: SubmitHandler<RegistrationFormData> = (data) => {
		registrationMutation.mutate({
			data,
		});
	};

	return {
		form,
		isPending: registrationMutation.status,
		onSubmit,
	} as const;
}

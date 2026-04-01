import { createFileRoute } from "@tanstack/react-router";
import { DynamicRegisterFormDescription } from "@/features/auth/components/dynamic-register-form-description";
import { RegistrationFlow } from "@/features/auth/components/registration-flow";
import { RegistrationProvider } from "@/features/auth/components/registration-provider";

export const Route = createFileRoute("/(authentication)/register")({
	component: RegisterView,
});

function RegisterView() {
	return (
		<RegistrationProvider>
			<RegistrationFlow
				title="أنشئ حسابك"
				description={<DynamicRegisterFormDescription />}
			/>
		</RegistrationProvider>
	);
}

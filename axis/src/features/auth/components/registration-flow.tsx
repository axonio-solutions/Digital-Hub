import { AuthCard } from "@/features/auth/components/auth-card";
import { useRegistrationContext } from "@/features/auth/components/registration-provider";
import { FormProvider } from "react-hook-form";
import { useRegistration } from "../hooks/use-registration";
import { AuthFooter } from "./auth-footer";
import { AuthLayout } from "./auth-layout";
import RegisterForm from "./forms/register";
import { RegistrationSuccess } from "./registration-success";

interface RegistrationFlowProps {
	title: string;
	description: React.ReactNode;
}

export function RegistrationFlow({
	title,
	description,
}: RegistrationFlowProps) {
	const { isSuccess } = useRegistrationContext();
	const { form } = useRegistration();

	if (isSuccess) {
		return <RegistrationSuccess />;
	}

	return (
		<AuthLayout footer={<AuthFooter variant="register" />}>
			<FormProvider {...form}>
				<AuthCard title={title} description={description}>
					<RegisterForm />
				</AuthCard>
			</FormProvider>
		</AuthLayout>
	);
}

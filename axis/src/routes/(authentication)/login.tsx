import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import LoginForm from "@/features/auth/components/forms/login";

export const Route = createFileRoute("/(authentication)/login")({
	component: LoginView,
});

function LoginView() {
	return (
		<AuthLayout footer={<AuthFooter variant="terms" />}>
			<AuthCard title="مرحبًا بعودتك" description="سجل الدخول إلى حسابك">
				<LoginForm />
			</AuthCard>
		</AuthLayout>
	);
}

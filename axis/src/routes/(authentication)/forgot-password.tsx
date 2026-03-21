import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import ForgotPasswordForm from "@/features/auth/components/forms/forgot-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authentication)/forgot-password")({
	component: ForgotPasswordView,
});

function ForgotPasswordView() {
	return (
		<AuthLayout>
			<AuthCard
				title="نسيت كلمة المرور؟"
				description="لا تقلق، سنرسل لك تعليمات إعادة التعيين"
			>
				<ForgotPasswordForm />
			</AuthCard>
		</AuthLayout>
	);
}

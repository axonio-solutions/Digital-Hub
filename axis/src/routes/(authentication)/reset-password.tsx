import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import ResetPasswordForm from "@/features/auth/components/forms/reset-password";

export const Route = createFileRoute("/(authentication)/reset-password")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	component: ResetPasswordView,
});

function ResetPasswordView() {
	return (
		<AuthLayout footer={<AuthFooter variant="terms" />}>
			<AuthCard
				title="إعادة تعيين كلمة المرور"
				description="الرجاء إدخال كلمة المرور الجديدة"
			>
				<ResetPasswordForm />
			</AuthCard>
		</AuthLayout>
	);
}

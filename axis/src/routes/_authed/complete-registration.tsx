import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import CompleteRegistrationForm from "@/features/auth/components/forms/complete-registration";
import { AUTH_ROUTES } from "@/features/auth/constants/config";

export const Route = createFileRoute("/_authed/complete-registration")({
	beforeLoad({ context }) {
		const { user } = context;
		if (user?.user_type !== "pending") {
			throw redirect({
				to: AUTH_ROUTES.DASHBOARD,
			});
		}
	},
	component: CompleteRegistrationView,
});

function CompleteRegistrationView() {
	return (
		<AuthLayout footer={<AuthFooter variant="terms" />}>
			<AuthCard title="أكمل تسجيلك" description="أخبرنا بعض المعلومات عنك">
				<CompleteRegistrationForm />
			</AuthCard>
		</AuthLayout>
	);
}

import { AUTH_ROUTES } from "@/features/auth/constants/config";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context, location }) => {
		const { user } = context;
		if (!user) {
			throw redirect({
				to: AUTH_ROUTES.LOGIN,
				search: {
					redirect: location.href,
				},
			});
		}
		if (user.user_type === "pending") {
			if (location.pathname !== AUTH_ROUTES.COMPLETE_REGISTRATION) {
				throw redirect({
					to: AUTH_ROUTES.COMPLETE_REGISTRATION,
					search: {
						redirect: location.href,
					},
				});
			}
		}
	},
});

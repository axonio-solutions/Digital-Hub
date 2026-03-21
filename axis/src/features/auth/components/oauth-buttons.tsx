import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { loginWithOAuthFn } from "@/fn/auth";
import { useMutation } from "@/hooks/use-mutation";
import { authClient } from "@/lib/auth-client";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AUTH_ROUTES } from "../constants/config";

interface OAuthButtonsProps {
	mode?: "signin" | "signup";
}

export default function OAuthButtons({ mode = "signin" }: OAuthButtonsProps) {
  const [isPending, setIsPending] = useState(false);
	const loginWithOAuthMutation = useMutation({
		fn: useServerFn(loginWithOAuthFn),
	});

	return (
		<div className="space-y-3">
			<Button
				variant="outline"
				className="w-full"
				disabled={loginWithOAuthMutation.status === "pending"}
				onClick={async () => {
					await authClient.signIn.social({
						provider: "google",
						callbackURL: AUTH_ROUTES.DASHBOARD,
						fetchOptions: {
							onRequest() {
								setIsPending(true);
							},
							// onResponse() {
							// 	setIsPending(false);
							// },
						},
					});
				}}
			>
				{isPending ? (
					<Icons.spinner />
				) : (
					<div className="flex items-center gap-2">
						<Icons.google className="h-4 w-4" />
						<span>
							{mode === "signin"
								? "تسجيل الدخول باستخدام Google"
								: "التسجيل باستخدام Google"}
						</span>
					</div>
				)}
			</Button>
		</div>
	);
}

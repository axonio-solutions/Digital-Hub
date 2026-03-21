import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import styles from "../styles.css?url";

import { Toaster } from "@/components/ui/sonner";
import { authQueries } from "@/features/auth/queries/auth-queries";
import type { RouterContext } from "@/types/router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(authQueries.user());
		return { user };
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Axis Platform",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: styles,
			},
		],
	}),
	component: () => {
		return (
			<RootDocument>
				<Outlet />
				<Toaster richColors theme="light" />
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
			</RootDocument>
		);
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ar" dir="rtl">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

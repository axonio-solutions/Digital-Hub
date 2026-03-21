import { Logo } from "@/components/logo";

interface AuthLayoutProps {
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Logo />
				{children}
				{footer}
			</div>
		</div>
	);
}

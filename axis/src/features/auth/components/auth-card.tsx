import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
	children: React.ReactNode;
	title: string;
	description: React.ReactNode;
	className?: string;
}

export function AuthCard({
	children,
	title,
	description,
	className,
}: AuthCardProps) {
	return (
		<div className={className}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">{title}</CardTitle>
					<CardDescription className="max-w-full sm:max-w-64 mx-auto">
						{description}
					</CardDescription>
				</CardHeader>
				<CardContent>{children}</CardContent>
			</Card>
		</div>
	);
}

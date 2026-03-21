interface SectionProps {
	title: string;
	description: string;
	children: React.ReactNode;
	className?: string;
}

export default function Section({
	title,
	description,
	children,
	className,
}: SectionProps) {
	return (
		<div className={`space-y-6 ${className ?? ""}`}>
			<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
				<div className="space-y-1 md:w-1/3">
					<h3 className="text-lg font-semibold">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
				<div className="flex-1 min-w-0 md:w-2/3">{children}</div>
			</div>
		</div>
	);
}

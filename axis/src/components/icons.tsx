import { cn } from "@/lib/utils";

type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
	google: ({ ...props }: IconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<title>google icon</title>
			<path
				fill="currentColor"
				d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
			/>
		</svg>
	),
	spinner: (props: IconProps, className?: string) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn(
				"h-4 w-4 animate-spin icon icon-tabler icons-tabler-outline icon-tabler-loader",
				className,
			)}
			{...props}
		>
			<title>spinner icon</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M12 6l0 -3" />
			<path d="M16.25 7.75l2.15 -2.15" />
			<path d="M18 12l3 0" />
			<path d="M16.25 16.25l2.15 2.15" />
			<path d="M12 18l0 3" />
			<path d="M7.75 16.25l-2.15 2.15" />
			<path d="M6 12l-3 0" />
			<path d="M7.75 7.75l-2.15 -2.15" />
		</svg>
	),
};

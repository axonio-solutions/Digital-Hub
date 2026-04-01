import * as React from "react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
	author: string;
	content: string;
	imgAlt: string;
	image?: string;
	spotlightColor?: string;
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
	(
		{
			author,
			content,
			imgAlt,
			image,
			spotlightColor = "#00000010",
			className,
			...props
		},
		ref,
	) => {
		const divRef = useRef<HTMLDivElement>(null);
		const [isFocused, setIsFocused] = useState(false);
		const [position, setPosition] = useState({ x: 0, y: 0 });
		const [opacity, setOpacity] = useState(0);

		const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
			if (!divRef.current || isFocused) return;
			const rect = divRef.current.getBoundingClientRect();
			setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
		};

		const handleFocus = () => {
			setIsFocused(true);
			setOpacity(0.6);
		};

		const handleBlur = () => {
			setIsFocused(false);
			setOpacity(0);
		};

		const handleMouseEnter = () => {
			setOpacity(0.6);
		};

		const handleMouseLeave = () => {
			setOpacity(0);
		};

		return (
			<div
				ref={(node) => {
					divRef.current = node;
					if (typeof ref === "function") {
						ref(node);
					} else if (ref) {
						(ref as React.MutableRefObject<HTMLDivElement | null>).current =
							node;
					}
				}}
				onMouseMove={handleMouseMove}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				dir="rtl"
				className={cn(
					"relative overflow-hidden rounded-2xl border border-neutral-300 bg-white p-6 transition-all hover:shadow-lg md:p-8",
					className,
				)}
				{...props}
			>
				{/* Spotlight overlay */}
				<div
					className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
					style={{
						opacity,
						background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
					}}
				/>
				{/* Quote icon (adjusted for RTL) */}
				<div className="absolute left-6 top-6 text-6xl font-serif text-orange-400">
					"
				</div>

				<div className="flex flex-col gap-4 justify-between h-full pt-12">
					<p className="text-pretty text-base text-neutral-600">{content}</p>

					<div className="flex items-center gap-4 justify-start">
						<div className="flex items-center gap-4">
							{image ? (
								<Avatar>
									<AvatarImage
										src={image}
										alt={imgAlt}
										height={48}
										width={48}
									/>
									<AvatarFallback>{author[0]}</AvatarFallback>
								</Avatar>
							) : (
								<Avatar>
									<AvatarFallback>{author[0]}</AvatarFallback>
								</Avatar>
							)}
							<div className="flex flex-col">
								<h3 className="font-semibold text-neutral-800">{author}</h3>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

Testimonial.displayName = "Testimonial";

export { Testimonial };

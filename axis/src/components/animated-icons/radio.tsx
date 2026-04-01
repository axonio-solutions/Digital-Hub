import { motion, useAnimation } from "motion/react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RadioIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface RadioIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
	autoAnimate?: boolean;
	animationInterval?: number;
}

const variants: Variants = {
	normal: {
		opacity: 1,
		transition: {
			duration: 0.4,
		},
	},
	fadeOut: {
		opacity: 0,
		transition: { duration: 0.2 },
	},
	fadeIn: (i: number) => ({
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 15,
			delay: i * 0.05,
		},
	}),
};

const RadioIcon = forwardRef<RadioIconHandle, RadioIconProps>(
	(
		{
			onMouseEnter,
			onMouseLeave,
			className,
			size = 28,
			autoAnimate = true,
			animationInterval = 1500,
			...props
		},
		ref,
	) => {
		const controls = useAnimation();
		const isControlledRef = useRef(false);
		const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

		const runAnimation = useCallback(async () => {
			await controls.start("fadeOut");
			controls.start("fadeIn");
		}, [controls]);

		const startAutomaticAnimation = useCallback(() => {
			if (autoAnimate) {
				const animationCycle = async () => {
					await runAnimation();

					animationTimerRef.current = setTimeout(
						animationCycle,
						animationInterval,
					);
				};

				animationCycle();
			}
		}, [autoAnimate, animationInterval, runAnimation]);

		useEffect(() => {
			if (autoAnimate) {
				startAutomaticAnimation();
			}

			return () => {
				if (animationTimerRef.current) {
					clearTimeout(animationTimerRef.current);
				}
			};
		}, [autoAnimate, startAutomaticAnimation]);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: runAnimation,
				stopAnimation: () => {
					if (animationTimerRef.current) {
						clearTimeout(animationTimerRef.current);
					}
					controls.start("normal");
				},
			};
		});

		const handleMouseEnter = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current && !autoAnimate) {
					runAnimation();
				} else {
					onMouseEnter?.(e);
				}
			},
			[runAnimation, onMouseEnter, autoAnimate],
		);

		const handleMouseLeave = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current && !autoAnimate) {
					controls.start("normal");
				} else {
					onMouseLeave?.(e);
				}
			},
			[controls, onMouseLeave, autoAnimate],
		);

		return (
			<div
				className={cn(
					"cursor-pointer select-none p-2 hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center",
					className,
				)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Radio Icon</title>
					<motion.path
						d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"
						initial={{ opacity: 1 }}
						variants={variants}
						animate={controls}
						custom={1}
					/>
					<motion.path
						d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"
						initial={{ opacity: 1 }}
						variants={variants}
						animate={controls}
						custom={0}
					/>
					<circle cx="12" cy="12" r="2" />
					<motion.path
						d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"
						initial={{ opacity: 1 }}
						variants={variants}
						animate={controls}
						custom={0}
					/>
					<motion.path
						d="M19.1 4.9C23 8.8 23 15.1 19.1 19"
						initial={{ opacity: 1 }}
						variants={variants}
						animate={controls}
						custom={1}
					/>
				</svg>
			</div>
		);
	},
);

RadioIcon.displayName = "RadioIcon";

export { RadioIcon };

import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";

export interface CoffeeIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

const pathVariants: Variants = {
	normal: {
		y: 0,
		opacity: 1,
	},
	animate: (custom: number) => ({
		y: -3,
		opacity: [0, 1, 0],
		transition: {
			repeat: Number.POSITIVE_INFINITY,
			duration: 1.5,
			ease: "easeInOut",
			delay: 0.2 * custom,
		},
	}),
};

const CoffeeIcon = forwardRef<CoffeeIconHandle, HTMLAttributes<HTMLDivElement>>(
	({ onMouseEnter, onMouseLeave, ...props }, ref) => {
		const controls = useAnimation();
		const isControlledRef = useRef(false);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: () => controls.start("animate"),
				stopAnimation: () => controls.start("normal"),
			};
		});

		const handleMouseEnter = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					controls.start("animate");
				} else {
					onMouseEnter?.(e);
				}
			},
			[controls, onMouseEnter],
		);

		const handleMouseLeave = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					controls.start("normal");
				} else {
					onMouseLeave?.(e);
				}
			},
			[controls, onMouseLeave],
		);

		return (
			<div
				className="select-none transition-colors duration-200 inline-block"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={{ overflow: "visible" }}
				>
					<motion.path
						d="M10 2v2"
						animate={controls}
						variants={pathVariants}
						custom={0.2}
					/>
					<motion.path
						d="M14 2v2"
						animate={controls}
						variants={pathVariants}
						custom={0.4}
					/>
					<motion.path
						d="M6 2v2"
						animate={controls}
						variants={pathVariants}
						custom={0}
					/>
					<path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
				</svg>
			</div>
		);
	},
);

CoffeeIcon.displayName = "CoffeeIcon";

export { CoffeeIcon };

import {  motion } from "motion/react";
import { forwardRef } from "react";
import type {Variants} from "motion/react";
import type React from "react";

const cursorVariants: Variants = {
	initial: { x: 0, y: 0 },
	animate: {
		x: [0, 0, -3, 0],
		y: [0, -4, 0, 0],
		transition: {
			duration: 1,
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "loop",
			bounce: 0.3,
		},
	},
};

const lineVariants: Variants = {
	initial: { opacity: 1, x: 0, y: 0 },
	animate: (custom: { x: number; y: number }) => ({
		opacity: 1,
		x: [0, custom.x, 0, 0],
		y: [0, custom.y, 0, 0],
		transition: {
			type: "tween",
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "loop",
			opacity: {
				duration: 1.5,
				times: [0, 0.2, 0.4, 0.6, 0.8, 1],
				repeat: Number.POSITIVE_INFINITY,
				repeatType: "loop",
			},
		},
	}),
};

const CursorClickIcon = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
	return (
		<div
			ref={ref}
			className="select-none transition-colors duration-200 inline-block"
			{...props}
		>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<motion.path
					d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
					variants={cursorVariants}
					initial="initial"
					animate="animate"
				/>
				<motion.path
					d="M14 4.1 12 6"
					variants={lineVariants}
					initial="initial"
					animate="animate"
					custom={{ x: 1, y: -1 }}
				/>
				<motion.path
					d="m5.1 8-2.9-.8"
					variants={lineVariants}
					initial="initial"
					animate="animate"
					custom={{ x: -1, y: 0 }}
				/>
				<motion.path
					d="m6 12-1.9 2"
					variants={lineVariants}
					initial="initial"
					animate="animate"
					custom={{ x: -1, y: 1 }}
				/>
				<motion.path
					d="M7.2 2.2 8 5.1"
					variants={lineVariants}
					initial="initial"
					animate="animate"
					custom={{ x: 0, y: -1 }}
				/>
			</svg>
		</div>
	);
});

CursorClickIcon.displayName = "CursorClickIcon";

export { CursorClickIcon };

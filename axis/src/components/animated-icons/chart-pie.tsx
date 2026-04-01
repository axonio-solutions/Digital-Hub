import { motion } from "motion/react";
import { forwardRef } from "react";
import type { Variants } from "motion/react";
import type { HTMLAttributes } from "react";

const pathVariants: Variants = {
	normal: { translateX: 0, translateY: 0 },
	animate: {
		translateX: 1.1,
		translateY: -1.1,
		transition: {
			duration: 1,
			repeat: Number.POSITIVE_INFINITY,
			repeatType: "reverse",
		},
	},
};

const ChartPieIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	(props, ref) => {
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
						d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"
						variants={pathVariants}
						initial="normal"
						animate="animate"
					/>
					<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
				</svg>
			</div>
		);
	},
);

ChartPieIcon.displayName = "ChartPieIcon";

export { ChartPieIcon };

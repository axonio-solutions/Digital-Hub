import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type UpvoteIconHandle = {};

const UpvoteIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	(props, ref) => {
		const controls = useAnimation();

		// Start the infinite animation immediately on mount.
		useEffect(() => {
			controls.start("animate");
		}, [controls]);

		return (
			<div
				ref={ref}
				className="select-none transition-colors duration-200 inline-block"
				{...props}
			>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					variants={{
						normal: {
							translateX: "0px",
							translateY: "0px",
							rotate: "0deg",
						},
						animate: {
							translateX: "-1px",
							translateY: "-2px",
							rotate: "-12deg",
							transition: {
								type: "tween",
								duration: 0.3,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "mirror",
							},
						},
					}}
					initial="normal"
					animate={controls}
				>
					<path d="M7 10v12" />
					<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
				</motion.svg>
			</div>
		);
	},
);

UpvoteIcon.displayName = "UpvoteIcon";

export { UpvoteIcon };

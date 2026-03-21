import { motion } from "motion/react";
import { BackgroundBeams } from "./background-beams";

export function CTASection() {
	return (
		<div className="w-full px-4">
			<div
				className="relative flex items-center justify-center overflow-hidden max-w-6xl mx-auto border-2 rounded-xl py-10 mb-16"
				dir="rtl"
			>
				<BackgroundBeams className="absolute inset-0" />
				<motion.div
					className="absolute inset-0 pointer-events-none"
					initial={{ backgroundPosition: "0% 0%" }}
					animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
					transition={{
						duration: 15,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					}}
					style={{
						background:
							"radial-gradient(circle at center, rgba(0,0,0,0.1), transparent 80%)",
					}}
				/>

				<div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 2 }}
						className="max-w-2xl mx-auto"
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tighter">
							جاهز لتحسين إدارة حجوزاتك؟
						</h1>
						<p className="text-lg mb-10">
							أصبح من السهل الآن إدارة الحجوزات والفعاليات بكفاءة وذكاء مع AXIS.
							انضم إلى مئات المطاعم والمقاهي التي تستخدم AXIS لتقديم تجربة سلسة
							لعملائها.
						</p>
						<motion.div
							initial={{
								y: 100,
								opacity: 0,
							}}
							animate={{
								y: 0,
								opacity: 1,
								transition: { duration: 0.5 },
							}}
						>
							<button
								type="button"
								className="box-border inline-block min-w-44 h-11 transform-gpu cursor-pointer touch-manipulation whitespace-nowrap rounded-full border-b-4 border-solid border-transparent bg-orange-600 px-4 py-3 text-center font-bold uppercase leading-5 tracking-wider text-white shadow-2xl outline-none transition-all duration-200 hover:brightness-110 active:border-b-0 active:border-t-4 active:bg-none disabled:cursor-auto"
							>
								ابدأ مجانا &larr;
								<span className="absolute inset-0 -z-10 rounded-full border-b-4 border-solid border-transparent bg-orange-500" />
							</button>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CalendarCogIcon } from "../animated-icons/calendar-cog";
import { CursorClickIcon } from "../animated-icons/cursor-click";
import { TrendingUpIcon } from "../animated-icons/trending-up";
import { ContainerScroll } from "../container-scroll-animation";

export function HeroScroll() {
	return (
		<div className="flex flex-col overflow-hidden pb-16 pt-32">
			<ContainerScroll
				titleComponent={
					<>
						<h1 className="text-4xl font-semibold text-black dark:text-white text-center leading-loose">
							نظام ذكي لإدارة الحجوزات والفعاليات <br />
							<span className="text-4xl md:text-6xl font-bold relative -start-4 text-center md:text-start md:-start-12">
								في المقاهي و <CycleText />
							</span>
						</h1>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center">
							AXIS يساعدك على تنظيم الحجوزات وإدارة الطاولات والفعاليات بذكاء،
							مما يتيح لك تحسين تجربة العملاء وزيادة الإيرادات.
						</p>
						<div className="mt-6 flex justify-center">
							<motion.div
								initial={{
									y: 100,
									opacity: 0,
								}}
								animate={{
									y: 0,
									opacity: 1,
									transition: {
										duration: 0.5,
									},
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
						</div>
						<ul className="mt-8 text-neutral-700 text-center flex gap-4 justify-center">
							<li className="flex items-center gap-2">
								<CursorClickIcon className="text-green-500" /> حجوزات فورية
								وسهلة
							</li>
							<li className="flex items-center gap-2">
								<CalendarCogIcon className="text-blue-500" /> إدارة فعاليات
								المطاعم والمقاهي
							</li>
							<li className="flex items-center gap-2">
								<TrendingUpIcon className="text-red-500" /> تحليلات تساعدك على
								اتخاذ قرارات أفضل
							</li>
						</ul>
					</>
				}
			>
				<img
					src="/hero-light.webp"
					alt="عرض توضيحي لـ AXIS"
					height={720}
					width={1400}
					className="mx-auto rounded-2xl object-cover h-full object-left-top"
					draggable={false}
				/>
			</ContainerScroll>
		</div>
	);
}

export const CycleText = () => {
	const words = ["المطاعم", "الفنادق", "الصالات"];
	const [index, setIndex] = useState(1);

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((current) => (current + 1) % words.length);
		}, 1300);
		return () => clearInterval(interval);
	}, []);

	return (
		<span className="inline-flex items-center">
			<span className="text-primary font-bold relative min-w-[6rem] h-[2rem] flex items-center justify-center">
				<AnimatePresence mode="wait">
					<motion.span
						key={words[index]}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.3 }}
						className="absolute w-full text-center"
					>
						{words[index]}
					</motion.span>
				</AnimatePresence>
			</span>
		</span>
	);
};

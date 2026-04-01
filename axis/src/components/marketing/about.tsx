import { BarChart3, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartPieIcon } from "../animated-icons/chart-pie";
import { RocketIcon } from "../animated-icons/rocket";
import { SparklesIcon } from "../animated-icons/sparkles";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const aboutData = [
	{
		title: "ما هو AXIS؟",
		content:
			"هو نظام متكامل يساعد المطاعم والمقاهي على إدارة الحجوزات وتنظيم الفعاليات بسهولة وذكاء، مما يسهم في تحسين تجربة العملاء وزيادة كفاءة الإدارة.",
		cardTitle: "التعريف",
		icon: Users,
	},
	{
		title: "مفهوم اسم AXIS",
		content:
			"كلمة AXIS تعني 'المحور'، وهو يعكس دور التطبيق كمركز أساسي لإدارة الحجوزات وتنظيم الفعاليات داخل المطاعم والمقاهي، مما يجعله الأداة الذكية الأمثل لهذا الغرض.",
		cardTitle: "المفهوم",
		icon: Trophy,
	},
	{
		title: "لماذا AXIS هو الحل الأمثل؟",
		content:
			"يوفر دقة في إدارة الحجوزات، واجهة استخدام سلسة، وتحليلات متقدمة تساعد أصحاب الأعمال على اتخاذ قرارات ذكية وتحسين استراتيجياتهم.",
		cardTitle: "المميزات",
		icon: BarChart3,
	},
];

function Card({
	title,
	description,
	content,
	className,
	isActive,
}: Readonly<{
	title: string;
	description: string;
	content: ReactNode;
	className: string;
	isActive: boolean;
}>) {
	return (
		<div
			className={cn(
				"group flex h-auto min-h-[168px] w-full md:max-w-[280px] transform-gpu flex-col rounded-xl border border-neutral-500/30 bg-white p-3 shadow-lg shadow-neutral-500/30 transition-all hover:shadow-xl dark:bg-neutral-800 md:h-42 md:w-auto md:min-h-0",
				className,
				isActive && "!rotate-0 !scale-105",
			)}
		>
			<div className="flex size-16 md:size-20 items-center justify-center">
				{content}
			</div>
			<p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm">
				{description}
			</p>
			<p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm md:text-base">
				{title}
			</p>
		</div>
	);
}

function TextComponent({
	number,
	title,
	content,
	isOpen,
	loadingWidthPercent,
}: Readonly<{
	number: number;
	title: string;
	content: string;
	isOpen: boolean;
	loadingWidthPercent?: number;
}>) {
	return (
		<div
			className={cn(
				"w-full transform-gpu rounded-lg border border-neutral-500/30 transition-all  md:mx-0 mx-auto",
				isOpen
					? "bg-gradient-to-b from-neutral-200/15 to-neutral-200/5"
					: "opacity-50",
			)}
		>
			<div className="flex w-full items-center gap-4 p-3 md:p-4">
				<p className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-500/20 text-neutral-600 dark:text-neutral-400">
					{number}
				</p>
				<h2 className="text-left font-medium text-neutral-800 dark:text-neutral-200 text-lg md:text-xl">
					{title}
				</h2>
			</div>
			<div
				className={cn(
					"w-full transform-gpu overflow-hidden text-left text-neutral-600 transition-all duration-500 dark:text-neutral-400",
					isOpen ? "max-h-64" : "max-h-0",
				)}
			>
				<p className="p-3 text-base md:text-lg md:p-4 text-start">{content}</p>
				<div className="w-full px-3 md:px-4 pb-4">
					<div className="relative h-1 w-full overflow-hidden rounded-full">
						<div
							className="absolute top-0 left-0 h-1 bg-orange-300"
							style={{ width: `${loadingWidthPercent}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function AnimatedAboutCards({ activeIndex }: { activeIndex: number }) {
	return (
		<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
			{aboutData.map((card, index) => (
				<Card
					key={card.cardTitle}
					className={cn(
						"transform-gpu hover:rotate-0 hover:scale-105 transition-all duration-300  ",
						"md:[&:nth-child(even)]:rotate-12 md:[&:nth-child(odd)]:-rotate-12 ",
						"md:-translate-x-[30px] ",
					)}
					content={
						<div className="flex items-center justify-center rounded-full bg-orange-200 p-2 md:p-3">
							<card.icon className="h-6 w-6 md:h-8 md:w-8 text-black" />
						</div>
					}
					description={`0${index + 1}`}
					title={card.cardTitle}
					isActive={activeIndex === index}
				/>
			))}
		</div>
	);
}

export const AboutSection = () => {
	const [featureOpen, setFeatureOpen] = useState<number>(0);
	const [timer, setTimer] = useState<number>(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimer((prev) => prev + 10);
		}, 10);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (timer > 10000) {
			setFeatureOpen((prev) => (prev + 1) % aboutData.length);
			setTimer(0);
		}
	}, [timer]);

	return (
		<section id="features" className="py-12 md:py-20 px-2 sm:px-4">
			<div className="max-w-6xl min-h-[500px] md:min-h-[700px] mx-auto">
				<div className="text-center mb-6 md:mb-16">
					<div className="flex justify-center items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold mb-4">
						{["تجربة استخدام سلسة", "أداء سريع وفعال", "تحليلات متقدمة"].map(
							(text, idx) => (
								<span
									key={text}
									className="flex items-center gap-1 md:gap-2 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-md"
								>
									{idx === 0 && (
										<SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
									)}
									{idx === 1 && (
										<RocketIcon className="w-4 h-4 md:w-5 md:h-5" />
									)}
									{idx === 2 && (
										<ChartPieIcon className="w-4 h-4 md:w-5 md:h-5" />
									)}
									{text}
								</span>
							),
						)}
					</div>
					<h2 className="text-xl md:text-3xl lg:text-4xl font-bold px-2">
						منصة متكاملة لـ{" "}
						<span className="text-orange-500">إدارة الحجوزات والفعاليات</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
					<div className="space-y-3 md:space-y-6 order-2 md:order-1 w-full">
						{aboutData.map((item, index) => (
							<button
								className="w-full focus:outline-none"
								key={item.title}
								onClick={() => {
									setFeatureOpen(index);
									setTimer(0);
								}}
								type="button"
							>
								<TextComponent
									content={item.content}
									isOpen={featureOpen === index}
									loadingWidthPercent={featureOpen === index ? timer / 100 : 0}
									number={index + 1}
									title={item.title}
								/>
							</button>
						))}
					</div>

					<div className="hidden  p-3 md:p-1 md:flex items-center justify-center h-auto md:h-[400px] order-1 md:order-2 mb-6 md:mb-0">
						<AnimatedAboutCards activeIndex={featureOpen} />
					</div>
				</div>
			</div>
		</section>
	);
};

import {
	IconBrandInstagram,
	IconBrandLinkedin,
	IconBrandMeta,
	IconBrandX,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { PlatformLogo } from "../../public/platform-logo";
import { cn } from "@/lib/utils";

const navigation = {
	features: [
		{ name: "نظام الحجوزات", href: "#features" },
		{ name: "إدارة الطاولات", href: "#features" },
		{ name: "العضويات المميزة", href: "#features" },
		{ name: "التقارير والإحصائيات", href: "#features" },
	],
	pricing: [
		{ name: "الباكيجات الشهرية", href: "/pricing" },
		{ name: "الباكيجات السنوية", href: "/pricing" },
		{ name: "المقارنة بين الباكيجات", href: "/pricing" },
		{ name: "الأسئلة الشائعة", href: "/faq" },
	],
	offers: [
		{ name: "عروض اليوم", href: "#offers" },
		{ name: "خصومات المجموعات", href: "#offers" },
		{ name: "عروض الأعياد", href: "#offers" },
		{ name: "كوبونات الخصم", href: "#offers" },
	],
};

export default function Footer({ className }: { className?: string }) {
	return (
		<footer id="footer" dir="rtl">
			<div
				className={cn(
					"mx-auto max-w-6xl px-3 pb-8 pt-16 sm:pt-24 lg:pt-32",
					className,
				)}
			>
				<div className="xl:grid xl:grid-cols-3 xl:gap-20">
					<div className="space-y-8 text-right">
						<PlatformLogo className="w-32 sm:w-40" />
						<p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
							منصة Axis الرائدة في المنطقة. نساعدك في إيجاد وتنظيم أفضل التجارب
							في مقاهي المدينة.
						</p>
						<div className="flex gap-4">
							<Link
								to="#"
								className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								<IconBrandMeta className="size-6" />
							</Link>
							<Link
								to="#"
								className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								<IconBrandInstagram className="size-6" />
							</Link>
							<Link
								to="#"
								className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								<IconBrandX className="size-6" />
							</Link>
							<Link
								to="#"
								className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							>
								<IconBrandLinkedin className="size-6" />
							</Link>
						</div>
					</div>

					<div className="mt-16 grid grid-cols-1 gap-14 sm:gap-8 md:grid-cols-3 xl:col-span-2 xl:mt-0">
						<div>
							<h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
								المميزات
							</h3>
							<ul className="mt-6 space-y-4">
								{navigation.features.map((item) => (
									<li key={item.name}>
										<Link
											to={item.href}
											className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
										>
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
								الأسعار
							</h3>
							<ul className="mt-6 space-y-4">
								{navigation.pricing.map((item) => (
									<li key={item.name}>
										<Link
											to={item.href}
											className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
										>
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
								العروض
							</h3>
							<ul className="mt-6 space-y-4">
								{navigation.offers.map((item) => (
									<li key={item.name}>
										<Link
											to={item.href}
											className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
										>
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:mt-20 sm:flex-row lg:mt-24 dark:border-gray-800">
					<p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
						© {new Date().getFullYear()} منصة Axis . جميع الحقوق محفوظة.
					</p>
					<div className="rounded-full border border-gray-200 py-1 pl-1 pr-2 dark:border-gray-800">
						<div className="flex items-center gap-1.5">
							<div className="relative size-4 shrink-0">
								<div className="absolute inset-[1px] rounded-full bg-green-500/20" />
								<div className="absolute inset-1 rounded-full bg-green-600" />
							</div>
							<span className="text-xs text-gray-700 dark:text-gray-50">
								جميع الأنظمة تعمل بكفاءة
							</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

import {
	IconAirConditioning,
	IconBoltFilled,
	IconCalendar,
	IconClock,
	IconConfetti,
	IconInfoCircleFilled,
	IconLocation,
	IconMapBolt,
	IconParking,
	IconShare3,
	IconTicket,
	IconTruckDelivery,
	IconWifi,
} from "@tabler/icons-react";
import CafeGallery from "./cafe-gallery";
import { PaymentMethodsSection } from "./payment-methods-section";
import { Button } from "@/components/ui/button";
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";

export function CafeDetailsSection({
	address,
	name,
	cafe_images,
}: {
	address: string | undefined;
	name: string | undefined;
	cafe_images: Array<string> | undefined;
}) {
	return (
		<section className="@container space-y-6">
			<div>
				<h1 className="text-4xl font-bold mb-1">{name}</h1>
			</div>
			<CafeGallery cafe_images={cafe_images} />
			<div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
				<div>
					<div className="flex flex-row gap-3 items-center mb-6 max-w-3xl">
						<div className="h-24 w-24 overflow-hidden rounded-xl">
							<img
								src="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=2487&auto=format&fit=crop"
								alt={name}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="grow space-y-1">
							<ClerkBadgeVariant label="مقهى عصري" />
							<h1 className="text-2xl font-semibold leading-tight text-text-primary">
								{name}
							</h1>
							<div className="text-sm">
								<span className="text-muted-foreground">{address}</span>
							</div>
						</div>
						<Button variant="outline">
							مُشاركة
							<IconShare3
								className="-me-1 opacity-60"
								size={16}
								aria-hidden="true"
							/>
						</Button>
					</div>
					<p>
						كافيه إل يمثّل الرفاهية المطلقة، وجهتك التي تثق بها دومًا لعيش تجربة
						فريدة من تناول الأطباق الشهية والاستمتاع بتصفح الكتب والمجلات التي
						تم اختيارها بعناية لتقديم تجربة مخصصة تناسب مبتكري الموضة وأساليب
						الحياة منذ 60 عامًا.
					</p>
					<CafeWorkingHours />
					<CafeAmenitiesSection />
					<CafeUpcomingEvents />
				</div>
				<div className="flex flex-col gap-6">
					<BookingSection />
					<PaymentMethodsSection />
				</div>
			</div>
		</section>
	);
}

export default function ClerkBadgeVariant({ label }: { label: string }) {
	return (
		<span className="relative bg-blue-50 px-[0.1875rem] font-medium text-[0.625rem]/[0.875rem] text-blue-500 dark:bg-blue-950">
			{label}
			<span className="-top-px absolute inset-x-[-0.1875rem] block transform-gpu text-blue-200 dark:text-blue-900">
				<svg
					aria-hidden="true"
					height="1"
					stroke="currentColor"
					strokeDasharray="3.3 1"
					width="100%"
				>
					<line x1="0" x2="100%" y1="0.5" y2="0.5" />
				</svg>
			</span>
			<span className="-bottom-px absolute inset-x-[-0.1875rem] block transform-gpu text-blue-200 dark:text-blue-900">
				<svg
					aria-hidden="true"
					height="1"
					stroke="currentColor"
					strokeDasharray="3.3 1"
					width="100%"
				>
					<line x1="0" x2="100%" y1="0.5" y2="0.5" />
				</svg>
			</span>
			<span className="-left-px absolute inset-y-[-0.1875rem] block transform-gpu text-blue-200 dark:text-blue-900">
				<svg
					aria-hidden="true"
					height="100%"
					stroke="currentColor"
					strokeDasharray="3.3 1"
					width="1"
				>
					<line x1="0.5" x2="0.5" y1="0" y2="100%" />
				</svg>
			</span>
			<span className="-right-px absolute inset-y-[-0.1875rem] block transform-gpu text-blue-200 dark:text-blue-900">
				<svg
					aria-hidden="true"
					height="100%"
					stroke="currentColor"
					strokeDasharray="3.3 1"
					width="1"
				>
					<line x1="0.5" x2="0.5" y1="0" y2="100%" />
				</svg>
			</span>
		</span>
	);
}

export function BookingSection() {
	return (
		<div className="bg-muted/50 rounded-xl overflow-hidden border border-gray-200 p-1 h-fit">
			<div className="bg-muted border flex flex-col justify-between rounded-lg h-full overflow-hidden">
				<div className="px-2 py-4 flex flex-col gap-2">
					<Button className="w-full rounded-xl min-h-12">
						احجز الآن <IconBoltFilled />
					</Button>
					<div className="text-center">
						<IconInfoCircleFilled className="inline size-5.5" />
						<span className="inline ps-1 text-sm italic">
							عربون الحجز <span className="font-bold text-blue-500">50</span>{" "}
							<SaudiRiyalSymbol className="inline w-4 text-blue-500" /> للشخص
						</span>
					</div>
				</div>
				<span className="text-center text-sm italic border-t py-2 bg-white text-balance">
					هذا المبلغ لتأكيد حجزك وسيكون ضمن الفاتورة النهائية من المطعم، مع
					العلم أن <span className="text-destructive">المبلغ غير مسترد</span>
				</span>
			</div>
		</div>
	);
}

export function CafeAmenitiesSection() {
	const amenities = [
		{
			title: "موقف سيارات",
			icon: <IconParking className="h-6 w-6 text-primary" />,
		},
		{
			title: "واي فاي",
			icon: <IconWifi className="h-6 w-6 text-primary" />,
		},
		{
			title: "تكييف",
			icon: <IconAirConditioning className="h-6 w-6 text-primary" />,
		},
		{
			title: "خدمة التوصيل",
			icon: <IconTruckDelivery className="h-6 w-6 text-primary" />,
		},
		{
			title: "فعاليات",
			icon: <IconConfetti className="h-6 w-6 text-primary" />,
		},
		{
			title: "سهولة الوصول",
			icon: <IconMapBolt className="h-6 w-6 text-primary" />,
		},
	];

	return (
		<section className="my-8">
			<h2 className="text-2xl font-semibold mb-4">الخدمات و المرافق</h2>

			<div className="@container">
				<div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-4">
					{amenities.map((amenity, index) => (
						<div
							key={index}
							className="flex flex-col items-center bg-muted/50 p-1 border rounded-xl"
						>
							<div className="border rounded-xl p-4 bg-muted w-full h-full flex flex-col gap-2 justify-center items-center">
								<div className="bg-accent p-0.5 border rounded-full w-20 h-20">
									<div className="bg-white p-1 w-full h-full border rounded-full flex items-center justify-center">
										{amenity.icon}
									</div>
								</div>
								<h3 className="font-medium text-center">{amenity.title}</h3>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function CafeWorkingHours() {
	return (
		<section className="my-8">
			<div className="flex items-center justify-between p-4 mb-5 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20 relative">
				<div className="flex flex-col items-start">
					<div className="text-sm text-primary/70 font-medium mb-1">
						ساعات العمل اليوم <ClerkBadgeVariant label="متاح للزيارة" />
					</div>
					<div className="text-primary font-bold text-xl">
						08:00 ص - 12:00 م
					</div>
					<div className="text-xs text-primary/60 mt-1">
						آخر طلب يتم استقباله الساعة 10:00 م
					</div>
				</div>
			</div>
		</section>
	);
}

interface Event {
	id: string;
	date: string;
	time: string;
	location: string;
	homeTeam: {
		name: string;
		logo: string;
	};
	awayTeam: {
		name: string;
		logo: string;
	};
}

export function CafeUpcomingEvents() {
	const events: Array<Event> = [
		{
			id: "1",
			homeTeam: {
				name: "الهلال",
				logo: "https://media.api-sports.io/football/teams/2932.png",
			},
			awayTeam: {
				name: "الأهلي",
				logo: "https://media.api-sports.io/football/teams/2929.png",
			},
			date: "15 أبريل 2025",
			time: "20:00",
			location: "القاعة الرئيسية",
		},
		{
			id: "2",
			homeTeam: {
				name: "الهلال",
				logo: "https://media.api-sports.io/football/teams/2932.png",
			},
			awayTeam: {
				name: "الأهلي",
				logo: "https://media.api-sports.io/football/teams/2929.png",
			},
			date: "15 أبريل 2025",
			time: "20:00",
			location: "القاعة الرئيسية",
		},
		{
			id: "3",
			homeTeam: {
				name: "الهلال",
				logo: "https://media.api-sports.io/football/teams/2932.png",
			},
			awayTeam: {
				name: "الأهلي",
				logo: "https://media.api-sports.io/football/teams/2929.png",
			},
			date: "18 أبريل 2025",
			time: "20:00",
			location: "القاعة الرئيسية",
		},
	];

	const groupedEvents: Record<string, Array<Event>> = events.reduce(
		(groups, event) => {
			const date = event.date;
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(event);
			return groups;
		},
		{} as Record<string, Array<Event>>,
	);

	return (
		<section className="my-8">
			<div className="border rounded-xl overflow-hidden">
				<div className="p-3 bg-primary/5 border-b flex justify-between items-center">
					<Button
						variant="outline"
						size="sm"
						className="text-primary flex items-center gap-1 text-xs"
					>
						<IconCalendar size={14} />
						المباريات القادمة
					</Button>
					<Button variant="ghost" size="sm" className="text-primary text-xs">
						عرض الكُل
					</Button>
				</div>

				<div className="divide-y">
					{Object.entries(groupedEvents).map(([date, dateEvents]) => (
						<div key={date} className="p-4">
							<div className="flex items-center gap-2 mb-3">
								<IconCalendar size={18} className="text-primary" />
								<h3 className="font-medium">{date}</h3>
							</div>

							<div className="space-y-4">
								{dateEvents.map((event) => (
									<div
										key={event.id}
										className="bg-muted/50 rounded-xl p-0.5 border"
									>
										<div className="flex justify-between items-center border bg-muted rounded-lg px-6 py-4">
											<div className="flex items-center gap-3 grow">
												<div className="grow">
													<div className="flex gap-4">
														<div className="flex items-center gap-2">
															<img
																src={event.homeTeam.logo}
																alt={event.homeTeam.name}
																className="size-4 object-contain"
															/>
															<h3 className="font-bold text-sm">
																{event.homeTeam.name}
															</h3>
														</div>
														<span>ضد</span>
														<div className="flex items-center gap-2">
															<img
																src={event.awayTeam.logo}
																alt={event.awayTeam.name}
																className="size-4 object-contain"
															/>
															<h3 className="font-bold text-sm">
																{event.awayTeam.name}
															</h3>
														</div>
													</div>

													<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
														<div className="flex items-center gap-1 text-gray-600">
															<IconClock size={14} />
															<span>{event.time}</span>
														</div>
														<div className="flex items-center gap-1 text-gray-600">
															<IconLocation size={14} />
															<span>{event.location}</span>
														</div>
														<div className="flex items-center gap-1 text-gray-600">
															<IconLocation size={14} />
															<span>دوري روشن السعودي</span>
														</div>
													</div>
												</div>
											</div>

											<div className="flex flex-col items-end gap-2">
												<Button className="bg-gradient-to-r from-primary to-primary/80 text-white">
													<IconTicket size={16} />
													احجز الآن
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}


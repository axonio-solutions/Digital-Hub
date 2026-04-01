import {
	IconBuildingStadium,
	IconCalendarEvent,
	IconChevronLeft,
	IconCircleDashed,
	IconCircleDashedCheck,
	IconClock,
	IconCoins,
	IconConfetti,
	IconMapPin,
	IconUsers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Add event type to differentiate between matches and other events
type EventType = "match" | "event";

interface UpcomingEvent {
	id: number;
	match: string; // Keeping the name "match" for backward compatibility
	date: string;
	time: string;
	commission: string;
	capacity: {
		total: number;
		remaining: number;
	};
	status: "active" | "booked";
	venue?: string;
	league?: string;
	type: EventType; // New field to identify event type
	description?: string; // Additional info for non-match events
	imageUrl?: string;
}

export function UpcomingEventsCard() {
	// Mock data for upcoming events - 2 matches and 2 other events
	const upcomingEvents: Array<UpcomingEvent> = [
		{
			id: 1,
			match: "الهلال vs النصر",
			date: "15 أبريل 2025",
			time: "20:00",
			commission: "85",
			capacity: {
				total: 60,
				remaining: 9,
			},
			status: "active",
			venue: "القاعة الرئيسية",
			league: "نهائي كأس خادم الحرمين الشريفين",
			type: "match",
			imageUrl: "/img/matches/hilal-vs-nassr.jpg",
		},
		{
			id: 2,
			match: "أمسية موسيقية حية",
			date: "16 أبريل 2025",
			time: "19:30",
			commission: "50",
			capacity: {
				total: 40,
				remaining: 15,
			},
			status: "booked",
			venue: "الساحة الخارجية",
			type: "event",
			description: "عرض موسيقي مع الفنان محمد عبده",
		},
		{
			id: 3,
			match: "الأهلي vs الاتحاد",
			date: "18 أبريل 2025",
			time: "21:00",
			commission: "65",
			capacity: {
				total: 45,
				remaining: 20,
			},
			status: "booked",
			venue: "القاعة الرئيسية",
			league: "الدوري السعودي",
			type: "match",
		},
		{
			id: 4,
			match: "أمسية شعرية",
			date: "22 أبريل 2025",
			time: "20:30",
			commission: "40",
			capacity: {
				total: 35,
				remaining: 25,
			},
			status: "booked",
			venue: "القاعة الثقافية",
			type: "event",
			description: "أمسية شعرية مع نخبة من الشعراء المحليين",
		},
	];

	// Helper to calculate sold tickets and percentage
	const getSoldInfo = (event: UpcomingEvent) => {
		const sold = event.capacity.total - event.capacity.remaining;
		const percentage = Math.round((sold / event.capacity.total) * 100);
		return { sold, percentage };
	};

	// Helper to get appropriate icon based on event type
	const getEventIcon = (type: EventType) => {
		return type === "match" ? (
			<IconBuildingStadium className="size-5" />
		) : (
			<IconConfetti className="size-5" />
		);
	};

	return (
		<Card className="w-full overflow-hidden h-full flex flex-col py-0 gap-0">
			<CardHeader className="border-b p-4 [.border-b]:py-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg font-bold">
							الفعاليات القادمة
						</CardTitle>
						<CardDescription className="text-xs mt-1">
							عرض الفعاليات القادمة المجدولة في المقهى الخاص بك
						</CardDescription>
					</div>
					<Badge
						variant="outline"
						className="bg-primary/5 text-primary border-primary/20 gap-1"
					>
						<IconClock className="size-3.5" />
						<span className="text-xs font-medium">القادمة</span>
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-0 flex-grow">
				<div className="space-y-px">
					{upcomingEvents.map((event, index) => {
						const { sold, percentage } = getSoldInfo(event);

						return (
							<div
								key={event.id}
								className={cn(
									"flex flex-col p-4 hover:bg-muted/40 transition-colors",
									index !== upcomingEvents.length - 1 && "border-b",
								)}
								dir="rtl"
							>
								{/* Top row - match/event info and status */}
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											{getEventIcon(event.type)}
										</div>
										<div>
											<h3 className="font-bold text-base">{event.match}</h3>
											{event.type === "match" && event.league ? (
												<div className="text-xs text-muted-foreground mt-0.5">
													{event.league}
												</div>
											) : event.description ? (
												<div className="text-xs text-muted-foreground mt-0.5">
													{event.description}
												</div>
											) : null}
										</div>
									</div>
									{/* Status badge */}
									<Badge
										variant="outline"
										className={cn(
											"px-2 py-0.5 flex items-center gap-1",
											event.status === "active"
												? "bg-green-50 text-green-700 border-green-200"
												: "bg-yellow-50 text-yellow-700 border-yellow-200",
										)}
									>
										{event.status === "active" ? (
											<IconCircleDashedCheck className="size-3.5" />
										) : (
											<IconCircleDashed className="size-3.5" />
										)}
										<span className="text-xs">
											{event.status === "active" ? "تجري الآن" : "مُجدولة"}
										</span>
									</Badge>
								</div>

								{/* Middle section - venue and time */}
								<div className="flex justify-between text-xs mb-3">
									<div className="flex items-center text-muted-foreground gap-0.5">
										<IconMapPin className="size-3.5" />
										<span>{event.venue}</span>
									</div>
									<div className="flex items-center text-muted-foreground gap-2">
										<div className="flex items-center gap-0.5">
											<IconCalendarEvent className="size-3.5" />
											<span>{event.date}</span>
										</div>
										<div className="flex items-center gap-0.5">
											<IconClock className="size-3.5" />
											<span>{event.time}</span>
										</div>
									</div>
								</div>

								{/* Capacity and booking info */}
								<div className="flex flex-col gap-3 mt-1 bg-muted/50 border rounded-xl p-2.5">
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-1.5 text-xs">
											<IconUsers className="size-3.5 text-muted-foreground" />
											<span>الحجوزات:</span>
											<span className="font-medium">
												{sold} / {event.capacity.total}
											</span>
										</div>
										<div className="flex items-center gap-1 text-xs">
											<IconCoins className="size-3.5 text-muted-foreground" />
											<span className="font-medium">{event.commission}</span>
											<SaudiRiyalSymbol className="size-3" />
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Progress
											value={percentage}
											className={cn(
												"h-1 flex-1",
												percentage > 85
													? "[&>div]:bg-green-400"
													: percentage > 50
														? "[&>div]:bg-orange-400"
														: "[&>div]:bg-blue-400",
											)}
										/>
										<span className="text-xs font-medium">{percentage}%</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>

			<CardFooter className="px-4 py-3 border-t [.border-t]:pt-3">
				<Link to="/dashboard/management/events" className="w-full">
					<Button variant="secondary" className="w-full cursor-pointer">
						<span>إدارة الفعاليات</span>
						<IconChevronLeft className="size-4" />
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}

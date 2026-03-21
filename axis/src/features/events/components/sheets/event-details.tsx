import type * as React from "react";
import type { z } from "zod";

import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
	IconCalendar,
	IconClock,
	IconInfoCircle,
	IconMapPin,
	IconProgress,
	IconProgressCheck,
	IconProgressX,
	IconTicket,
	IconUsers,
} from "@tabler/icons-react";
import type { eventsSchema } from "../events-table";

interface EventDetailsSheetProps {
	event: z.infer<typeof eventsSchema>;
	children: React.ReactNode;
}

const DetailItem = ({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}) => (
	<div className="flex gap-3 items-start">
		<div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
			{icon}
		</div>
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="text-sm font-medium">{value}</p>
		</div>
	</div>
);

export function EventDetailsSheet({ event, children }: EventDetailsSheetProps) {
	// Format the status badge
	const getStatusBadge = (status: string) => {
		return (
			<Badge
				variant="outline"
				className={cn(
					"px-2.5 py-0.5",
					status === "active"
						? "bg-green-50 text-green-700 border-green-200"
						: status === "upcoming"
							? "bg-blue-50 text-blue-700 border-blue-200"
							: "bg-gray-50 text-gray-700 border-gray-200",
				)}
			>
				{status === "active" ? (
					<IconProgressCheck className="h-4 w-4 ml-1" />
				) : status === "upcoming" ? (
					<IconProgress className="h-4 w-4 ml-1" />
				) : (
					<IconProgressX className="h-4 w-4 ml-1" />
				)}
				{status === "active"
					? "جارية"
					: status === "upcoming"
						? "قادمة"
						: "منتهية"}
			</Badge>
		);
	};

	// Parse the date string into a Date object
	const eventDate = new Date(event.eventDate);

	// Format date to be more readable
	const formatDate = (date: Date) => {
		// Using Intl.DateTimeFormat for Arabic locale formatting
		const options: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Intl.DateTimeFormat("ar-SA", options).format(date);
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="link"
					className="text-foreground w-fit px-0 text-right"
				>
					{children}
				</Button>
			</SheetTrigger>
			<SheetContent
				className="w-full sm:max-w-md p-0 overflow-hidden"
				side="right"
			>
				<SheetHeader className="p-6 border-b">
					<div className="flex justify-between items-center pt-5">
						<SheetTitle className="text-xl font-bold">
							تفاصيل الفعالية
						</SheetTitle>
						{getStatusBadge(event.status)}
					</div>
					<SheetDescription>
						رقم الفعالية: <span className="font-mono">{event.id}</span>
					</SheetDescription>
				</SheetHeader>

				<ScrollArea dir="rtl" className="h-[calc(100vh-8rem)]">
					<div className="px-4 space-y-6">
						{/* Event Information */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">معلومات الفعالية</h3>
							<div className="grid grid-cols-1 gap-4">
								<DetailItem
									icon={<IconInfoCircle className="size-4" />}
									label="اسم الفعالية"
									value={event.eventName}
								/>
								<DetailItem
									icon={<IconCalendar className="size-4" />}
									label="تاريخ الفعالية"
									value={formatDate(eventDate)}
								/>
								<DetailItem
									icon={<IconClock className="size-4" />}
									label="وقت الفعالية"
									value="19:00" // Mock time, should come from API
								/>
							</div>
						</div>

						<Separator />

						{/* Venue Details */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">تفاصيل المكان</h3>
							<div className="grid grid-cols-1 gap-4">
								<DetailItem
									icon={<IconMapPin className="size-4" />}
									label="المكان"
									value={event.location}
								/>
								<DetailItem
									icon={<IconUsers className="size-4" />}
									label="السعة"
									value={`${event.capacity} شخص`}
								/>
							</div>
						</div>

						<Separator />

						{/* Ticket Information */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">معلومات التذاكر</h3>

							<div className="bg-muted p-4 rounded-xl border">
								<div className="space-y-3">
									<DetailItem
										icon={<IconTicket className="size-4" />}
										label="سعر التذكرة"
										value={
											<div className="flex items-center gap-1">
												<span>{event.ticketPrice}</span>
												<SaudiRiyalSymbol />
											</div>
										}
									/>

									<div className="pt-3 border-t">
										<div className="text-sm space-y-2">
											<div className="flex justify-between">
												<span>إجمالي المبيعات المتوقع</span>
												<div className="flex items-center gap-1">
													<span className="font-medium">
														{Number.parseInt(event.ticketPrice) *
															event.capacity}
													</span>
													<SaudiRiyalSymbol className="size-3" />
												</div>
											</div>
											<div className="flex justify-between">
												<span>عدد التذاكر المباعة</span>
												<span className="font-medium">
													{event.status === "finished"
														? event.capacity
														: event.status === "active"
															? Math.floor(event.capacity * 0.6)
															: 0}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<Separator />

						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">معلومات إضافية</h3>
							<div className="p-4 bg-muted rounded-xl border">
								<p className="text-sm">
									هذه الفعالية{" "}
									{event.status === "active"
										? "جارية حالياً"
										: event.status === "upcoming"
											? "قادمة قريباً"
											: "انتهت بنجاح"}
									.
									{event.status === "upcoming" &&
										" يُرجى التأكد من جاهزية المكان والموظفين."}
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

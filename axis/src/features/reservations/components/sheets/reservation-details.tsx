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
	IconCreditCard,
	IconMapPin,
	IconPhone,
	IconProgress,
	IconProgressCheck,
	IconProgressX,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import type { schema } from "../cafe-reservations-table";

interface ReservationDetailsSheetProps {
	reservation: z.infer<typeof schema>;
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

export function ReservationDetailsSheet({
	reservation,
	children,
}: ReservationDetailsSheetProps) {
	// Format the status badge
	const getStatusBadge = (status: string) => {
		return (
			<Badge
				variant="outline"
				className={cn(
					"px-2.5 py-0.5",
					status === "confirmed"
						? "bg-green-50 text-green-700 border-green-200"
						: status === "pending"
							? "bg-yellow-50 text-yellow-700 border-yellow-200"
							: "bg-red-50 text-red-700 border-red-200",
				)}
			>
				{status === "confirmed" ? (
					<IconProgressCheck className="h-4 w-4 ml-1" />
				) : status === "pending" ? (
					<IconProgress className="h-4 w-4 ml-1" />
				) : (
					<IconProgressX className="h-4 w-4 ml-1" />
				)}
				{status === "confirmed"
					? "مؤكد"
					: status === "pending"
						? "قيد الانتظار"
						: "ملغي"}
			</Badge>
		);
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="link"
					className="text-foreground w-fit px-0 cursor-pointer"
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
						<SheetTitle className="text-xl font-bold">تفاصيل الحجز</SheetTitle>
						{getStatusBadge(reservation.status)}
					</div>
					<SheetDescription>
						رقم الحجز: <span className="font-mono">{reservation.id}</span>
					</SheetDescription>
				</SheetHeader>

				<ScrollArea dir="rtl" className="h-[calc(100vh-8rem)]">
					<div className="px-4 space-y-6">
						{/* Customer Information */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">معلومات العميل</h3>
							<div className="grid grid-cols-1 gap-4">
								<DetailItem
									icon={<IconUser className="size-4" />}
									label="اسم الضيف"
									value={reservation.guestName}
								/>
								<DetailItem
									icon={<IconPhone className="size-4" />}
									label="رقم الهاتف"
									value={reservation.phoneNumber}
								/>
							</div>
						</div>

						<Separator />

						{/* Reservation Details */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">تفاصيل الحجز</h3>
							<div className="grid grid-cols-1 gap-4">
								<DetailItem
									icon={<IconMapPin className="size-4" />}
									label="المنطقة"
									value={reservation.area}
								/>
								<DetailItem
									icon={<IconUsers className="size-4" />}
									label="عدد الضيوف"
									value={`${reservation.guestCount} شخص`}
								/>
								<DetailItem
									icon={<IconCalendar className="size-4" />}
									label="التاريخ"
									value="2025/04/05" // Mock date, should come from API
								/>
								<DetailItem
									icon={<IconClock className="size-4" />}
									label="الوقت"
									value="19:30" // Mock time, should come from API
								/>
							</div>
						</div>

						<Separator />

						{/* Payment Details */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">تفاصيل الدفع</h3>

							<div className="bg-muted p-4 rounded-xl border">
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-sm">سعر الشخص الواحد</span>
										<div className="flex items-center gap-1">
											<span className="text-sm font-medium">
												{Math.round(
													Number.parseInt(reservation.totalPrice) /
														reservation.guestCount,
												)}
											</span>
											<SaudiRiyalSymbol className="size-3" />
										</div>
									</div>

									<div className="flex justify-between">
										<span className="text-sm">عدد الأشخاص</span>
										<span className="text-sm font-medium">
											{reservation.guestCount}
										</span>
									</div>

									<Separator className="my-1" />

									<div className="flex justify-between items-center">
										<span className="text-sm font-bold">المجموع</span>
										<div className="flex items-center gap-1 text-primary">
											<span className="text-lg font-bold">
												{reservation.totalPrice}
											</span>
											<SaudiRiyalSymbol />
										</div>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 mt-4">
								<IconCreditCard className="size-4 text-muted-foreground" />
								<span className="text-sm">تم الدفع بواسطة بطاقة الائتمان</span>
							</div>
						</div>

						{/* Special Requests Section */}
						<Separator />

						<div className="space-y-2">
							<h3 className="text-sm font-semibold mb-3">طلبات خاصة</h3>
							<div className="p-4 bg-muted rounded-xl border">
								<p className="text-sm">
									{reservation.specialRequests || "لا توجد طلبات خاصة"}
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

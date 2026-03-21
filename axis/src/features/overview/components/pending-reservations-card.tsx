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
import { cn } from "@/lib/utils";
import {
	IconCalendarTime,
	IconCheck,
	IconChevronLeft,
	IconProgress,
	IconProgressCheck,
	IconProgressX,
	IconUser,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

interface Reservation {
	id: number;
	guestName: string;
	phoneNumber: string;
	area: string;
	guestCount: number;
	totalPrice: string;
	status: "pending" | "confirmed" | "cancelled";
	date: string;
	time: string;
	specialRequests?: string;
}

export function PendingReservationsCard() {
	// Mock data for pending reservations - only showing pending ones
	const pendingReservations: Reservation[] = [
		{
			id: 101,
			guestName: "أحمد محمد",
			phoneNumber: "0555123456",
			area: "القاعة الأساسية",
			guestCount: 6,
			totalPrice: "420",
			status: "pending",
			date: "15 أبريل 2025",
			time: "19:30",
		},
		{
			id: 102,
			guestName: "سارة عبدالله",
			phoneNumber: "0505789123",
			area: "قاعة VIP",
			guestCount: 4,
			totalPrice: "360",
			status: "pending",
			date: "16 أبريل 2025",
			time: "20:00",
			specialRequests:
				"طاولة قريبة من النافذة، مع توفير مقاعد إضافية للأطفال، ونطلب تحضير كعكة مناسبة وتحتوي شمعة للاحتفال بعيد ميلاد أحد أفراد العائلة. نرجو عدم وضع مكسرات في الطعام بسبب الحساسية.",
		},
		{
			id: 103,
			guestName: "محمد العتيبي",
			phoneNumber: "0565432198",
			area: "القاعة الرئيسية",
			guestCount: 8,
			totalPrice: "560",
			status: "pending",
			date: "16 أبريل 2025",
			time: "21:30",
		},
	];

	const getStatusBadge = (status: Reservation["status"]) => {
		return (
			<Badge
				variant="outline"
				className={cn(
					"px-2 py-0.5 flex items-center gap-1",
					status === "confirmed"
						? "bg-green-50 text-green-700 border-green-200"
						: status === "pending"
							? "bg-yellow-50 text-yellow-700 border-yellow-200"
							: "bg-red-50 text-red-700 border-red-200",
				)}
			>
				{status === "confirmed" ? (
					<IconProgressCheck className="size-3.5" />
				) : status === "pending" ? (
					<IconProgress className="size-3.5" />
				) : (
					<IconProgressX className="size-3.5" />
				)}
				<span className="text-xs">
					{status === "confirmed"
						? "مؤكد"
						: status === "pending"
							? "قيد الانتظار"
							: "ملغي"}
				</span>
			</Badge>
		);
	};

	return (
		<Card className="w-full overflow-hidden h-full flex flex-col py-0 gap-0">
			<CardHeader className="border-b p-4 [.border-b]:py-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg font-bold">
							حجوزات قيد الانتظار
						</CardTitle>
						<CardDescription className="text-xs mt-1">
							حجوزات جديدة بحاجة للمراجعة والتأكيد
						</CardDescription>
					</div>
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"
					>
						<IconProgress className="size-3.5" />
						<span className="text-xs font-medium">
							{pendingReservations.length} حجوزات مُعلقة
						</span>
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-0 flex-grow">
				<div className="space-y-px">
					{pendingReservations.length > 0 ? (
						pendingReservations.map((reservation, index) => (
							<div
								key={reservation.id}
								className={cn(
									"flex flex-col p-4 hover:bg-muted/40 transition-colors",
									index !== pendingReservations.length - 1 && "border-b",
								)}
								dir="rtl"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<IconUser className="size-5" />
										</div>
										<div>
											<h3 className="font-bold text-base">
												{reservation.guestName}
											</h3>
											<div className="text-xs text-muted-foreground mt-0.5">
												{reservation.phoneNumber}
											</div>
										</div>
									</div>
									{getStatusBadge(reservation.status)}
								</div>

								<div className="flex justify-between text-xs mb-3">
									<div className="flex items-center text-muted-foreground gap-0.5">
										<IconUsers className="size-3.5" />
										<span className="font-medium">
											{reservation.guestCount} أشخاص
										</span>
										<span className="mx-1">•</span>
										<span>{reservation.area}</span>
									</div>
									<div className="flex items-center text-muted-foreground gap-2">
										<div className="flex items-center gap-0.5">
											<IconCalendarTime className="size-3.5" />
											<span>
												{reservation.date} - {reservation.time}
											</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-3 mt-1 bg-muted/50 border rounded-xl p-0">
									<div className="px-3 py-2 flex items-center justify-between border-b">
										<span className="text-xs font-medium">التفاصيل</span>
										<div className="flex items-center gap-1 text-xs">
											<span className="font-medium">
												{reservation.totalPrice}
											</span>
											<SaudiRiyalSymbol className="size-3" />
										</div>
									</div>

									{reservation.specialRequests ? (
										<div className="p-3 text-xs">
											<div className="font-medium mb-1 text-foreground">
												طلبات خاصة:
											</div>
											<p className="text-muted-foreground">
												{reservation.specialRequests}
											</p>
										</div>
									) : (
										<div className="px-3 py-2 text-xs text-muted-foreground">
											لا توجد طلبات خاصة
										</div>
									)}
								</div>

								<div className="flex justify-end gap-2 mt-3">
									<Button
										size="sm"
										variant="ghost"
										className="cursor-pointer hover:text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
									>
										<IconX className="size-3.5" />
										رفض
									</Button>
									<Button
										size="sm"
										variant="default"
										className="cursor-pointer"
									>
										<IconCheck className="size-3.5" />
										تأكيد
									</Button>
								</div>
							</div>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
							<IconProgressCheck className="size-12 text-green-500 mb-3" />
							<h3 className="text-lg font-medium">لا توجد حجوزات معلقة</h3>
							<p className="text-sm text-muted-foreground mt-1">
								ستظهر الحجوزات الجديدة التي تحتاج إلى التأكيد هنا
							</p>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="px-4 py-3 border-t [.border-t]:pt-3">
				<Link to="/dashboard/management/reservations" className="w-full">
					<Button variant="secondary" className="w-full cursor-pointer">
						<span>إدارة الحجوزات</span>
						<IconChevronLeft className="size-4" />
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}

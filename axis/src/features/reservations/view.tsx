import { IconBolt, IconCalendarUser, IconStack2 } from "@tabler/icons-react";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useState } from "react";
import { CafeReservationsTable } from "./components/cafe-reservations-table";

// Cafe reservations data
const reservationData = [
	{
		id: 1,
		guestName: "أحمد محمد",
		phoneNumber: "0555123456",
		area: "القاعة الأساسية",
		guestCount: 60,
		totalPrice: "3500",
		status: "pending",
	},
	{
		id: 2,
		guestName: "سارة علي",
		phoneNumber: "0505789123",
		area: "قاعة الملكية",
		guestCount: 120,
		totalPrice: "8200",
		status: "confirmed",
	},
	{
		id: 3,
		guestName: "خالد عبدالله",
		phoneNumber: "0565432198",
		area: "القاعة الرئيسية",
		guestCount: 85,
		totalPrice: "5000",
		status: "confirmed",
	},
	{
		id: 4,
		guestName: "نورة فهد",
		phoneNumber: "0532156789",
		area: "قاعة VIP",
		guestCount: 40,
		totalPrice: "4200",
		status: "cancelled",
	},
	{
		id: 5,
		guestName: "عبدالرحمن سعيد",
		phoneNumber: "0501234567",
		area: "القاعة الأساسية",
		guestCount: 70,
		totalPrice: "4100",
		status: "pending",
	},
	{
		id: 6,
		guestName: "فاطمة محمد",
		phoneNumber: "0551237890",
		area: "قاعة الملكية",
		guestCount: 150,
		totalPrice: "9500",
		status: "confirmed",
	},
	{
		id: 7,
		guestName: "عبدالعزيز حمد",
		phoneNumber: "0506789012",
		area: "القاعة الرئيسية",
		guestCount: 90,
		totalPrice: "5500",
		status: "pending",
	},
	{
		id: 8,
		guestName: "منيرة سالم",
		phoneNumber: "0534567890",
		area: "قاعة VIP",
		guestCount: 35,
		totalPrice: "3800",
		status: "confirmed",
	},
];

export const ReservationsView = () => {
  const [selectedView, setSelectedView] = useState("cafes");
	return (
		<div className="container mx-auto px-4 space-y-4">
			<div className="space-y-0.5 px-4 lg:px-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
					إدارة الحجوزات
				</h1>
				<p className="text-xs sm:text-sm text-muted-foreground">
					إدارة حجوزات المقهى و الفعاليات
				</p>
			</div>

			<Tabs
				dir="rtl"
				value={selectedView}
				onValueChange={setSelectedView}
				className="w-full flex-col justify-start gap-6"
			>
				<div className="flex items-center justify-between px-4 lg:px-6">
					<Label htmlFor="view-selector" className="sr-only">
						عرض
					</Label>
					<Select
						dir="rtl"
						value={selectedView}
						onValueChange={setSelectedView}
					>
						<SelectTrigger
							className="flex w-fit @4xl/main:hidden"
							size="sm"
							id="view-selector"
						>
							<SelectValue placeholder="اختر العرض" />
						</SelectTrigger>
						<SelectContent className="[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
							<SelectItem value="cafes">
								<IconCalendarUser className="size-3.5 sm:size-4" />
								<span>حجوزات المقهى</span>
							</SelectItem>
							<SelectItem value="events">
								<IconBolt className="size-3.5 sm:size-4" />
								<span>حجوزات الفعاليات</span>
							</SelectItem>
							<SelectItem value="waitlist">
								<IconBolt className="size-3.5 sm:size-4" />
								<span>قائمة الإنتظار</span>
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList
						dir="rtl"
						className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
					>
						<TabsTrigger
							value="cafes"
							role="tab"
							aria-selected={false}
							aria-controls="cafes-content"
						>
							<IconCalendarUser className="size-3.5 sm:size-4" />
							<span>حجوزات المقهى</span>
						</TabsTrigger>
						<TabsTrigger
							value="waitlist"
							role="tab"
							aria-selected={false}
							aria-controls="waitlist-content"
							disabled
						>
							<IconStack2 className="size-3.5 sm:size-4" />
							<span>قائمة الإنتظار</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Reservations Tab Content */}
				<TabsContent
					value="cafes"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<CafeReservationsTable data={reservationData} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

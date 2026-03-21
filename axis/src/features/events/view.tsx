import {
	IconBuildingStadium,
	IconConfetti,
	IconListCheck,
} from "@tabler/icons-react";

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
import { EventsTable } from "./components/events-table";
import { MatchesTable } from "./components/matches-table";

const matchesData = [
	{
		id: 1,
		match: "Al-Hilal Saudi FC vs Al-Nassr",
		date: "4 أبريل 2025",
		time: "21:00",
		commission: "6",
		capacity: {
			total: 60,
			remaining: 31,
		},
		status: "active",
	},
	{
		id: 2,
		match: "Al-Ahli Saudi FC vs Al-Ittihad",
		date: "6 أبريل 2025",
		time: "19:30",
		commission: "5",
		capacity: {
			total: 45,
			remaining: 25,
		},
		status: "booked",
	},
	{
		id: 3,
		match: "Al-Shabab vs Al-Fayha",
		date: "8 أبريل 2025",
		time: "20:15",
		commission: "4",
		capacity: {
			total: 40,
			remaining: 20,
		},
		status: "active",
	},
	{
		id: 4,
		match: "Barcelona vs Real Madrid",
		date: "10 أبريل 2025",
		time: "22:00",
		commission: "8",
		capacity: {
			total: 80,
			remaining: 40,
		},
		status: "active",
	},
	{
		id: 5,
		match: "Manchester United vs Liverpool",
		date: "12 أبريل 2025",
		time: "18:30",
		commission: "7",
		capacity: {
			total: 70,
			remaining: 35,
		},
		status: "booked",
	},
	{
		id: 6,
		match: "Juventus vs AC Milan",
		date: "15 أبريل 2025",
		time: "20:45",
		commission: "6",
		capacity: {
			total: 50,
			remaining: 28,
		},
		status: "active",
	},
	{
		id: 7,
		match: "Bayern Munich vs Borussia Dortmund",
		date: "18 أبريل 2025",
		time: "19:30",
		commission: "7",
		capacity: {
			total: 65,
			remaining: 30,
		},
		status: "booked",
	},
	{
		id: 8,
		match: "PSG vs Marseille",
		date: "20 أبريل 2025",
		time: "21:00",
		commission: "5",
		capacity: {
			total: 55,
			remaining: 25,
		},
		status: "active",
	},
];

const eventsData = [
	{
		id: 1,
		eventName: "ليلة الشعر العربي",
		eventDate: "2025/04/15",
		location: "القاعة الرئيسية",
		capacity: 120,
		ticketPrice: "50",
		status: "upcoming",
	},
	{
		id: 2,
		eventName: "عرض موسيقي حي",
		eventDate: "2025/04/03",
		location: "الساحة الخارجية",
		capacity: 200,
		ticketPrice: "75",
		status: "active",
	},
	{
		id: 3,
		eventName: "أمسية قراءة",
		eventDate: "2025/04/10",
		location: "القاعة الثقافية",
		capacity: 80,
		ticketPrice: "30",
		status: "upcoming",
	},
	{
		id: 4,
		eventName: "معرض الفن المعاصر",
		eventDate: "2025/03/25",
		location: "صالة العرض",
		capacity: 150,
		ticketPrice: "40",
		status: "finished",
	},
	{
		id: 5,
		eventName: "ورشة عمل الخط العربي",
		eventDate: "2025/04/05",
		location: "قاعة النشاطات",
		capacity: 45,
		ticketPrice: "100",
		status: "active",
	},
	{
		id: 6,
		eventName: "حفل إطلاق كتاب",
		eventDate: "2025/04/20",
		location: "المكتبة",
		capacity: 70,
		ticketPrice: "25",
		status: "upcoming",
	},
	{
		id: 7,
		eventName: "مهرجان القهوة",
		eventDate: "2025/03/15",
		location: "الساحة الرئيسية",
		capacity: 300,
		ticketPrice: "60",
		status: "finished",
	},
	{
		id: 8,
		eventName: "ندوة أدبية",
		eventDate: "2025/04/08",
		location: "القاعة الثقافية",
		capacity: 90,
		ticketPrice: "35",
		status: "upcoming",
	},
];

export const EventsView = () => {
  const [selectedView, setSelectedView] = useState("matches");
	return (
		<div className="container mx-auto px-4 space-y-4">
			<div className="space-y-0.5 px-4 lg:px-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
					إدارة الفعاليات
				</h1>
				<p className="text-xs sm:text-sm text-muted-foreground">
					إدارة الفعاليات والمباريات في المقهى الخاص بك
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
							<SelectItem value="matches">
								<IconBuildingStadium className="size-3.5 sm:size-4" />
								<span>المباريات</span>
							</SelectItem>
							<SelectItem disabled value="special-events">
								<IconConfetti className="size-3.5 sm:size-4" />
								<span>فعاليات خاصة</span>
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList
						dir="rtl"
						className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
					>
						<TabsTrigger
							value="matches"
							role="tab"
							aria-selected={false}
							aria-controls="matches-content"
						>
							<IconBuildingStadium className="size-3.5 sm:size-4" />
							<span>المباريات</span>
						</TabsTrigger>
						<TabsTrigger
							value="matches-reservations"
							role="tab"
							aria-selected={false}
							aria-controls="matches-content"
						>
							<IconListCheck className="size-3.5 sm:size-4" />
							<span>حجوزات المباريات</span>
						</TabsTrigger>
						<TabsTrigger
							disabled
							value="special-events"
							role="tab"
							aria-selected={false}
							aria-controls="special-events-content"
						>
							<IconConfetti className="size-3.5 sm:size-4" />
							<span>فعاليات خاصة</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Matches Tab Content */}
				<TabsContent
					value="matches"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<MatchesTable data={matchesData} />
				</TabsContent>

				{/* Events Tab Content */}
				<TabsContent
					value="matches-reservations"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<EventsTable data={eventsData} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

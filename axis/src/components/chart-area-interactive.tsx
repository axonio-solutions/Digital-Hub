import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import type {ChartConfig} from "@/components/ui/chart";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "رسم بياني تفاعلي لإحصائيات المقهى";

const chartData = [
	{ date: "2024-04-01", customers: 222, reservations: 150, events: 3 },
	{ date: "2024-04-02", customers: 197, reservations: 180, events: 2 },
	{ date: "2024-04-03", customers: 167, reservations: 120, events: 1 },
	{ date: "2024-04-04", customers: 242, reservations: 160, events: 2 },
	{ date: "2024-04-05", customers: 373, reservations: 190, events: 3 },
	{ date: "2024-04-06", customers: 301, reservations: 240, events: 4 },
	{ date: "2024-04-07", customers: 245, reservations: 180, events: 2 },
	{ date: "2024-04-08", customers: 309, reservations: 220, events: 3 },
	{ date: "2024-04-09", customers: 259, reservations: 210, events: 2 },
	{ date: "2024-04-10", customers: 261, reservations: 190, events: 1 },
	{ date: "2024-04-11", customers: 327, reservations: 250, events: 3 },
	{ date: "2024-04-12", customers: 292, reservations: 210, events: 2 },
	{ date: "2024-04-13", customers: 342, reservations: 280, events: 4 },
	{ date: "2024-04-14", customers: 237, reservations: 220, events: 2 },
	{ date: "2024-04-15", customers: 220, reservations: 170, events: 1 },
	{ date: "2024-04-16", customers: 238, reservations: 190, events: 2 },
	{ date: "2024-04-17", customers: 346, reservations: 260, events: 3 },
	{ date: "2024-04-18", customers: 364, reservations: 310, events: 4 },
	{ date: "2024-04-19", customers: 243, reservations: 180, events: 2 },
	{ date: "2024-04-20", customers: 289, reservations: 150, events: 1 },
	{ date: "2024-04-21", customers: 237, reservations: 200, events: 2 },
	{ date: "2024-04-22", customers: 224, reservations: 170, events: 1 },
	{ date: "2024-04-23", customers: 238, reservations: 230, events: 3 },
	{ date: "2024-04-24", customers: 287, reservations: 290, events: 3 },
	{ date: "2024-04-25", customers: 215, reservations: 250, events: 2 },
	{ date: "2024-04-26", customers: 275, reservations: 230, events: 1 },
	{ date: "2024-04-27", customers: 383, reservations: 320, events: 4 },
	{ date: "2024-04-28", customers: 222, reservations: 180, events: 2 },
	{ date: "2024-04-29", customers: 315, reservations: 240, events: 3 },
	{ date: "2024-04-30", customers: 354, reservations: 280, events: 3 },
	{ date: "2024-05-01", customers: 265, reservations: 220, events: 2 },
	{ date: "2024-05-02", customers: 293, reservations: 210, events: 3 },
	{ date: "2024-05-03", customers: 247, reservations: 190, events: 2 },
	{ date: "2024-05-04", customers: 385, reservations: 320, events: 4 },
	{ date: "2024-05-05", customers: 381, reservations: 290, events: 3 },
	{ date: "2024-05-06", customers: 398, reservations: 320, events: 4 },
	{ date: "2024-05-07", customers: 288, reservations: 200, events: 2 },
	{ date: "2024-05-08", customers: 249, reservations: 210, events: 2 },
	{ date: "2024-05-09", customers: 227, reservations: 180, events: 1 },
	{ date: "2024-05-10", customers: 293, reservations: 230, events: 3 },
	{ date: "2024-05-11", customers: 335, reservations: 270, events: 3 },
	{ date: "2024-05-12", customers: 297, reservations: 240, events: 2 },
	{ date: "2024-05-13", customers: 297, reservations: 260, events: 2 },
	{ date: "2024-05-14", customers: 348, reservations: 290, events: 3 },
	{ date: "2024-05-15", customers: 373, reservations: 280, events: 4 },
	{ date: "2024-05-16", customers: 338, reservations: 300, events: 3 },
	{ date: "2024-05-17", customers: 399, reservations: 320, events: 4 },
	{ date: "2024-05-18", customers: 315, reservations: 250, events: 3 },
	{ date: "2024-05-19", customers: 235, reservations: 180, events: 2 },
	{ date: "2024-05-20", customers: 277, reservations: 230, events: 2 },
	{ date: "2024-05-21", customers: 282, reservations: 240, events: 1 },
	{ date: "2024-05-22", customers: 281, reservations: 220, events: 1 },
	{ date: "2024-05-23", customers: 252, reservations: 290, events: 3 },
	{ date: "2024-05-24", customers: 294, reservations: 220, events: 2 },
	{ date: "2024-05-25", customers: 301, reservations: 250, events: 3 },
	{ date: "2024-05-26", customers: 213, reservations: 170, events: 1 },
	{ date: "2024-05-27", customers: 320, reservations: 260, events: 3 },
	{ date: "2024-05-28", customers: 233, reservations: 190, events: 2 },
	{ date: "2024-05-29", customers: 278, reservations: 230, events: 1 },
	{ date: "2024-05-30", customers: 340, reservations: 280, events: 3 },
	{ date: "2024-05-31", customers: 278, reservations: 230, events: 2 },
	{ date: "2024-06-01", customers: 278, reservations: 200, events: 2 },
	{ date: "2024-06-02", customers: 370, reservations: 310, events: 4 },
	{ date: "2024-06-03", customers: 303, reservations: 260, events: 1 },
	{ date: "2024-06-04", customers: 339, reservations: 280, events: 3 },
	{ date: "2024-06-05", customers: 288, reservations: 240, events: 1 },
	{ date: "2024-06-06", customers: 294, reservations: 250, events: 2 },
	{ date: "2024-06-07", customers: 323, reservations: 270, events: 3 },
	{ date: "2024-06-08", customers: 385, reservations: 320, events: 4 },
	{ date: "2024-06-09", customers: 338, reservations: 280, events: 3 },
	{ date: "2024-06-10", customers: 255, reservations: 200, events: 2 },
	{ date: "2024-06-11", customers: 292, reservations: 250, events: 1 },
	{ date: "2024-06-12", customers: 392, reservations: 320, events: 4 },
	{ date: "2024-06-13", customers: 281, reservations: 230, events: 1 },
	{ date: "2024-06-14", customers: 326, reservations: 280, events: 3 },
	{ date: "2024-06-15", customers: 307, reservations: 250, events: 3 },
	{ date: "2024-06-16", customers: 371, reservations: 310, events: 4 },
	{ date: "2024-06-17", customers: 375, reservations: 320, events: 3 },
	{ date: "2024-06-18", customers: 307, reservations: 270, events: 2 },
	{ date: "2024-06-19", customers: 341, reservations: 290, events: 3 },
	{ date: "2024-06-20", customers: 308, reservations: 250, events: 2 },
	{ date: "2024-06-21", customers: 369, reservations: 310, events: 3 },
	{ date: "2024-06-22", customers: 317, reservations: 270, events: 3 },
	{ date: "2024-06-23", customers: 380, reservations: 330, events: 4 },
	{ date: "2024-06-24", customers: 332, reservations: 280, events: 2 },
	{ date: "2024-06-25", customers: 341, reservations: 290, events: 2 },
	{ date: "2024-06-26", customers: 334, reservations: 280, events: 3 },
	{ date: "2024-06-27", customers: 348, reservations: 290, events: 3 },
	{ date: "2024-06-28", customers: 349, reservations: 300, events: 2 },
	{ date: "2024-06-29", customers: 303, reservations: 260, events: 1 },
	{ date: "2024-06-30", customers: 346, reservations: 300, events: 4 },
];

const chartConfig = {
	analytics: {
		label: "إحصائيات",
	},
	customers: {
		label: "الزبائن",
		color: "var(--chart-3)",
	},
	reservations: {
		label: "الحجوزات",
		color: "var(--chart-1)",
	},
	events: {
		label: "الفعاليات",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export function ChartAreaInteractive() {
	const isMobile = useIsMobile();
	const [timeRange, setTimeRange] = React.useState("90d");

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d");
		}
	}, [isMobile]);

	const filteredData = chartData.filter((item) => {
		const date = new Date(item.date);
		const referenceDate = new Date("2024-06-30");
		let daysToSubtract = 90;
		if (timeRange === "30d") {
			daysToSubtract = 30;
		} else if (timeRange === "7d") {
			daysToSubtract = 7;
		}
		const startDate = new Date(referenceDate);
		startDate.setDate(startDate.getDate() - daysToSubtract);
		return date >= startDate;
	});

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>إحصائيات المقهى</CardTitle>
				<CardDescription>
					<span className="hidden @[540px]/card:block">إجمالي آخر 3 أشهر</span>
					<span className="@[540px]/card:hidden">آخر 3 أشهر</span>
				</CardDescription>
				<CardAction>
					<ToggleGroup
						type="single"
						value={timeRange}
						onValueChange={setTimeRange}
						variant="outline"
						className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
					>
						<ToggleGroupItem value="90d">آخر 3 أشهر</ToggleGroupItem>
						<ToggleGroupItem value="30d">آخر 30 يوم</ToggleGroupItem>
						<ToggleGroupItem value="7d">آخر 7 أيام</ToggleGroupItem>
					</ToggleGroup>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger
							className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
							size="sm"
							aria-label="Select a value"
						>
							<SelectValue placeholder="Last 3 months" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							<SelectItem value="90d" className="rounded-lg">
								آخر 3 أشهر
							</SelectItem>
							<SelectItem value="30d" className="rounded-lg">
								آخر 30 يوم
							</SelectItem>
							<SelectItem value="7d" className="rounded-lg">
								آخر 7 أيام
							</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="fillCustomers" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-customers)"
									stopOpacity={1.0}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-customers)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillReservations" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-reservations)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-reservations)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-events)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-events)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value);
								const day = date.getDate();
								const month = date.toLocaleDateString("ar", {
									month: "short",
								});
								return `${day} ${month}`;
							}}
						/>
						<ChartTooltip
							cursor={false}
							defaultIndex={isMobile ? -1 : 10}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										const date = new Date(value);
										const day = date.getDate();
										const month = date.toLocaleDateString("ar", {
											month: "short",
										});
										return `${day} ${month}`;
									}}
									indicator="dot"
								/>
							}
						/>
						<Area
							dataKey="events"
							type="natural"
							fill="url(#fillEvents)"
							stroke="var(--color-events)"
						/>
						<Area
							dataKey="reservations"
							type="natural"
							fill="url(#fillReservations)"
							stroke="var(--color-reservations)"
						/>
						<Area
							dataKey="customers"
							type="natural"
							fill="url(#fillCustomers)"
							stroke="var(--color-customers)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

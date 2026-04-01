import { IconLoader, IconMoodWrrrFilled } from "@tabler/icons-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateMatchFormData } from "../schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUpcomingFixtures } from "@/features/events/hooks/use-fixtures";

// Import Button component
import { Button } from "@/components/ui/button";

interface MatchSelectProps {
	form: UseFormReturn<CreateMatchFormData>;
	onMatchSelect: (selectedMatch: {
		matchId: number;
		startTime: string;
		homeTeam: string;
		awayTeam: string;
	}) => void;
}

export function MatchSelect({ form, onMatchSelect }: MatchSelectProps) {
	const selectedLeagueId = Number.parseInt(form.watch("league"), 10);

	const { data, isLoading, error } = useUpcomingFixtures(
		Number.isNaN(selectedLeagueId) ? undefined : selectedLeagueId,
	);

	if (!selectedLeagueId) return null;

	const handleMatchSelect = (matchId: string) => {
		if (!data?.response) return;

		const match = data.response.find(
			(m) => m.fixture.id.toString() === matchId,
		);
		if (!match) return;

		form.setValue("match", matchId, { shouldValidate: true });

		onMatchSelect({
			matchId: match.fixture.id,
			startTime: match.fixture.date,
			homeTeam: match.teams.home.name,
			awayTeam: match.teams.away.name,
		});
	};

	const groupMatchesByDate = () => {
		if (!data?.response || data.response.length === 0) return [];

		const groupedMatches: Array<{ date: Date; matches: typeof data.response }> = [];

		for (const match of data.response) {
			const matchDate = new Date(match.fixture.date);
			const dateKey = new Date(
				matchDate.getFullYear(),
				matchDate.getMonth(),
				matchDate.getDate(),
			);

			const existingGroup = groupedMatches.find((group) =>
				isSameDay(group.date, dateKey),
			);

			if (existingGroup) {
				existingGroup.matches.push(match);
			} else {
				groupedMatches.push({
					date: dateKey,
					matches: [match],
				});
			}
		}

		return groupedMatches.sort((a, b) => a.date.getTime() - b.date.getTime());
	};

	const isSameDay = (date1: Date, date2: Date) => {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	};

	const groupedMatches = groupMatchesByDate();

	const formatDate = (date: Date) => {
		try {
			const formatter = new Intl.DateTimeFormat("ar", {
				weekday: "long",
				day: "numeric",
				month: "long",
			});
			return formatter.format(date);
		} catch (e) {
			return date.toLocaleDateString();
		}
	};

	const formatTime = (dateStr: string) => {
		try {
			const date = new Date(dateStr);
			return date.toLocaleTimeString("ar", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
		} catch (e) {
			// Fallback formatting if locale isn't supported
			const date = new Date(dateStr);
			return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
		}
	};

	return (
		<FormField
			control={form.control}
			name="match"
			render={({ field }) => (
				<FormItem className="space-y-0">
					<Label className="text-right">اختر المباراة</Label>
					{isLoading ? (
						<div className="flex items-center justify-center p-4">
							<IconLoader className="h-6 w-6 animate-spin" />
						</div>
					) : error ? (
						<div className="rounded-md border bg-red-50 text-red-700 border-red-200 px-4 py-3">
							<div className="flex gap-3">
								<IconMoodWrrrFilled
									className="shrink-0 text-red-500 size-6"
									aria-hidden="true"
								/>
								<div className="flex grow justify-between items-center gap-3">
									<p className="text-sm">حدث خطأ أثناء تحميل المُباريات</p>
									<Button className="p-0 h-fit cursor-pointer" variant="link">
										حاول مُجددا
									</Button>
								</div>
							</div>
						</div>
					) : !data || !data.response || groupedMatches.length === 0 ? (
						<Alert>
							<AlertDescription>
								لا توجد مباريات متاحة في الأسابيع القادمة
							</AlertDescription>
						</Alert>
					) : (
						<Select
							dir="rtl"
							value={field.value}
							onValueChange={handleMatchSelect}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="اختر المباراة" />
							</SelectTrigger>
							<SelectContent className="max-h-[25rem] space-y-2 bg-background text-sm p-0 w-[var(--radix-popover-trigger-width)]">
								{groupedMatches.map((group, groupIndex) => (
									<React.Fragment key={group.date.toISOString()}>
										{groupIndex > 0 && (
											<SelectSeparator className="h-px mx-0 my-1 bg-border" />
										)}
										<SelectGroup className="space-y-1">
											<SelectLabel className="px-2 py-1.5 text-xs font-medium rounded bg-secondary">
												{formatDate(group.date)}
											</SelectLabel>
											{group.matches.map((match) => (
												<SelectItem
													showIndicator={false}
													key={match.fixture.id}
													value={match.fixture.id.toString()}
													className="relative [&>span]:w-full [&>span]:justify-between w-full rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer border hover:text-accent-foreground data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-800 data-[state=checked]:border data-[state=checked]:border-blue-200 data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground aria-state:bg-blue-50 aria-state:text-blue-800 aria-state:border aria-state:border-blue-200"
												>
													<div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
														<img
															src={match.teams.home.logo}
															alt={match.teams.home.name}
															className="w-5 h-5 object-contain"
														/>
														<span className="text-sm truncate">
															{match.teams.home.name}
														</span>
													</div>
													<div className="text-xs text-muted-foreground px-2 whitespace-nowrap mx-2">
														{match.fixture.date.substring(11, 16)}
													</div>
													<div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
														<span className="text-sm truncate">
															{match.teams.away.name}
														</span>
														<img
															src={match.teams.away.logo}
															alt={match.teams.away.name}
															className="w-5 h-5 object-contain"
														/>
													</div>
												</SelectItem>
											))}
										</SelectGroup>
									</React.Fragment>
								))}
							</SelectContent>
						</Select>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

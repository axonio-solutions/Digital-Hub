import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { updateMatchEventFn } from "@/fn/events";
import { cn } from "@/lib/utils";
import { IconEdit } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { eventsQueries } from "../../queries";
import {
	type EditMatchEntry,
	type EditMatchFormValues,
	editMatchSchema,
} from "../../schema";

interface EditMatchSheetProps {
	match: EditMatchEntry;
	onSuccess?: (updatedMatch: EditMatchEntry) => void;
}

export function EditMatchSheet({ match, onSuccess }: EditMatchSheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	// Format the date string for input type="date"
	const formatDateForInput = (dateStr: string) => {
		try {
			// If the date is already in YYYY-MM-DD format, return it directly
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
				return dateStr;
			}

			// Try to parse Arabic date
			const arabicDateMatch = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
			if (arabicDateMatch) {
				const [_, day, month, year] = arabicDateMatch;
				const monthNames = [
					"يناير",
					"فبراير",
					"مارس",
					"أبريل",
					"مايو",
					"يونيو",
					"يوليو",
					"أغسطس",
					"سبتمبر",
					"أكتوبر",
					"نوفمبر",
					"ديسمبر",
				];
				const monthIndex = monthNames.indexOf(month);
				if (monthIndex !== -1) {
					// Format as YYYY-MM-DD
					return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
				}
			}

			// If we can't parse the date, return today's date in YYYY-MM-DD format
			const today = new Date();
			return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		} catch (error) {
			// If all else fails, return today's date
			const today = new Date();
			return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		}
	};

	// Helper function to format date in Arabic
	const formatDateInArabic = (dateStr: string) => {
		try {
			const date = new Date(dateStr);
			if (!isNaN(date.getTime())) {
				return format(date, "EEEE, d MMMM yyyy", { locale: ar });
			}
			return dateStr;
		} catch (error) {
			return dateStr;
		}
	};

	// Initialize form with match data
	const form = useForm<EditMatchFormValues>({
		resolver: zodResolver(editMatchSchema),
		defaultValues: {
			matchName: match.match,
			date: formatDateForInput(match.date),
			time: match.time,
			totalCapacity: match.capacity.total,
			remainingCapacity: match.capacity.remaining,
			status: match.status,
			notes: "", // Optional notes
		},
	});

	const queryClient = useQueryClient();

	const updateMatchEventMutaion = useMutation({
		mutationFn: (update: EditMatchEntry) =>
			updateMatchEventFn({ data: update }),
		onMutate: async (update) => {
			await queryClient.cancelQueries(eventsQueries.matchEvents().queryKey);
			const previousMatchEvents = queryClient.getQueryData(
				eventsQueries.matchEvents().queryKey,
			);

			queryClient.setQueryData(
				eventsQueries.matchEvents().queryFn,
				(old = []) => {
					return old.filter((match) =>
						match.id === update.id ? update : match,
					);
				},
			);
			return { previousMatchEvents };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				eventsQueries.matchEvents().queryKey,
				context?.previousMatchEvents,
			);
			toast.error("حدث خطأ أثناء تحديث المباراة");
		},
		onSuccess: () => {
			toast.success("تم تحديث المباراة بنجاح");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: eventsQueries.matchEvents().queryKey,
			});
			setIsPending(false);
		},
	});
	// Handle form submission
	const onSubmit = (data: EditMatchFormValues) => {
		if (!data) return;

		try {
			setIsPending(true);

			const convertArabicDate = (dateStr: string) => {
				if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
					return dateStr;
				}

				const arabicDateMatch = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
				if (arabicDateMatch) {
					const [_, day, month, year] = arabicDateMatch;
					const monthNames = [
						"يناير",
						"فبراير",
						"مارس",
						"أبريل",
						"مايو",
						"يونيو",
						"يوليو",
						"أغسطس",
						"سبتمبر",
						"أكتوبر",
						"نوفمبر",
						"ديسمبر",
					];
					const monthIndex = monthNames.indexOf(month);
					if (monthIndex !== -1) {
						// Format as YYYY-MM-DD
						return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
					}
				}

				return formatDateForInput(match.date);
			};

			const finalDate = convertArabicDate(data.date);

			const updatedMatch: EditMatchEntry = {
				...match,
				match: data.matchName,
				date: finalDate,
				time: data.time,
				capacity: {
					total: data.totalCapacity,
					remaining: data.remainingCapacity,
				},
				status: data.status,
			};

			updateMatchEventMutaion.mutate(updatedMatch);
		} catch (error) {
			toast.error("حدث خطأ أثناء تحديث المباراة", {
				description: "يرجى المحاولة مرة أخرى",
			});
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="size-7 cursor-pointer"
					onClick={() => setIsOpen(true)}
				>
					<IconEdit className="h-4 w-4" />
				</Button>
			</SheetTrigger>
			<SheetContent
				className="w-full sm:max-w-sm p-0 overflow-hidden"
				side="right"
			>
				<SheetHeader className="p-6 border-b">
					<SheetTitle className="text-xl font-bold pt-5">
						تعديل معلومات المباراة
					</SheetTitle>
					<SheetDescription>
						رقم المباراة: <span className="font-mono">{match.id}</span>
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea dir="rtl" className="h-[calc(100vh-14rem)]">
							<div className="px-6 py-4 space-y-6">
								<FormField
									control={form.control}
									name="matchName"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>اسم المباراة</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="date"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>تاريخ المباراة</FormLabel>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={"outline"}
																className={cn(
																	"w-full ps-3 text-start font-normal",
																	!field.value && "text-muted-foreground",
																)}
															>
																{field.value ? (
																	formatDateInArabic(field.value)
																) : (
																	<span>اختر التاريخ</span>
																)}
																<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-1" align="start">
														<Calendar
															mode="single"
															selected={
																field.value
																	? new Date(field.value + "T00:00:00.000Z")
																	: undefined
															}
															onSelect={(date) => {
																if (date) {
																	// Create date in UTC to avoid timezone issues
																	const utcDate = new Date(
																		Date.UTC(
																			date.getFullYear(),
																			date.getMonth(),
																			date.getDate(),
																			0,
																			0,
																			0,
																			0,
																		),
																	);
																	field.onChange(
																		utcDate.toISOString().split("T")[0],
																	);
																}
															}}
															disabled={(date) => date < new Date("1900-01-01")}
															locale={ar}
															dir="rtl"
															classNames={{
																button_next: "rtl:[&_svg]:rotate-180",
																button_previous: "rtl:[&_svg]:rotate-180",
															}}
														/>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="time"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>وقت المباراة</FormLabel>
											<FormControl>
												<div className="relative grow">
													<Input
														id="match-time"
														type="time"
														step="1"
														{...field}
														className="peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
													/>
													<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
														<ClockIcon size={16} aria-hidden="true" />
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="totalCapacity"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>السعة الكلية</FormLabel>
											<FormControl>
												<NumberInputWithMinsPlusButtons
													min={0}
													value={field.value}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="remainingCapacity"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>المقاعد المتبقية</FormLabel>
											<FormControl>
												<NumberInputWithMinsPlusButtons
													min={0}
													value={field.value}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>الحالة</FormLabel>
											<Select
												dir="rtl"
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="اختر الحالة" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="upcoming">مُجدولة</SelectItem>
													<SelectItem value="ongoing">تجري الآن</SelectItem>
													<SelectItem value="completed">مكتملة</SelectItem>
													<SelectItem value="cancelled">ملغية</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel>ملاحظات</FormLabel>
											<FormControl>
												<Textarea
													className="min-h-[100px]"
													placeholder="أي معلومات إضافية حول المباراة..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</ScrollArea>

						<SheetFooter className="p-6 border-t flex-row gap-2 sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="flex-1 sm:flex-initial"
							>
								إلغاء
							</Button>
							<Button
								type="submit"
								disabled={isPending || !form.formState.isDirty}
								className="flex-1 sm:flex-initial"
							>
								{isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}

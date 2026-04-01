import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
	IconCalendar,
	IconClock,
	IconEdit,
	IconInfoCircle,
	IconMapPin,
	IconTicket,
	IconUsers,
} from "@tabler/icons-react";
import type { eventsSchema } from "../events-table";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

// Define form schema for editing events
const eventFormSchema = z.object({
	eventName: z.string().min(2, { message: "اسم الفعالية مطلوب" }),
	eventDate: z.string().min(1, { message: "تاريخ الفعالية مطلوب" }),
	eventTime: z.string().min(1, { message: "وقت الفعالية مطلوب" }),
	location: z.string().min(1, { message: "المكان مطلوب" }),
	capacity: z.number().min(1, { message: "السعة يجب أن تكون 1 على الأقل" }),
	ticketPrice: z.string().min(1, { message: "سعر التذكرة مطلوب" }),
	status: z.string(),
	description: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EditEventSheetProps {
	event: z.infer<typeof eventsSchema>;
	onSuccess?: () => void;
}

export function EditEventSheet({ event, onSuccess }: EditEventSheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	// Format the date string for input type="date"
	const formatDateForInput = (dateStr: string) => {
		const parts = dateStr.split("/");
		if (parts.length === 3) {
			return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(
				2,
				"0",
			)}`;
		}
		return dateStr;
	};

	// Initialize form with event data
	const form = useForm<EventFormValues>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			eventName: event.eventName,
			eventDate: formatDateForInput(event.eventDate),
			eventTime: "19:00", // Mock time, should come from API
			location: event.location,
			capacity: event.capacity,
			ticketPrice: event.ticketPrice,
			status: event.status,
			description: "", // Mock description, should come from API
		},
	});

	// Available locations for selection
	const locations = [
		"القاعة الرئيسية",
		"الساحة الخارجية",
		"القاعة الثقافية",
		"صالة العرض",
		"قاعة النشاطات",
		"المكتبة",
		"الساحة الرئيسية",
	];

	// Handle form submission
	const onSubmit = async (data: EventFormValues) => {
		try {
			setIsPending(true);

			// Mock API call - replace with your actual update API
			await new Promise((resolve) => setTimeout(resolve, 800));

			toast.success(`تم تحديث فعالية "${data.eventName}" بنجاح`);
			setIsOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error("حدث خطأ أثناء تحديث الفعالية", {
				description: "يرجى المحاولة مرة أخرى",
			});
		} finally {
			setIsPending(false);
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
				className="w-full sm:max-w-md p-0 overflow-hidden"
				side="right"
			>
				<SheetHeader className="p-6 border-b">
					<SheetTitle className="text-xl font-bold pt-5">
						تعديل معلومات الفعالية
					</SheetTitle>
					<SheetDescription>
						رقم الفعالية: <span className="font-mono">{event.id}</span>
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea dir="rtl" className="h-[calc(100vh-12rem)]">
							<div className="px-6 py-4 space-y-6">
								{/* Event Information */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">
										معلومات الفعالية
									</h3>

									<FormField
										control={form.control}
										name="eventName"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconInfoCircle className="size-4" />
													اسم الفعالية
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="eventDate"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconCalendar className="size-4" />
													تاريخ الفعالية
												</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="eventTime"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconClock className="size-4" />
													وقت الفعالية
												</FormLabel>
												<FormControl>
													<Input type="time" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Venue Details */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">تفاصيل المكان</h3>

									<FormField
										control={form.control}
										name="location"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconMapPin className="size-4" />
													المكان
												</FormLabel>
												<FormControl>
													<Select
														dir="rtl"
														value={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="اختر المكان" />
														</SelectTrigger>
														<SelectContent>
															{locations.map((location) => (
																<SelectItem key={location} value={location}>
																	{location}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="capacity"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconUsers className="size-4" />
													السعة
												</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														{...field}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Ticket Information */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">
										معلومات التذاكر
									</h3>

									<FormField
										control={form.control}
										name="ticketPrice"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconTicket className="size-4" />
													سعر التذكرة
												</FormLabel>
												<FormControl>
													<Input {...field} dir="ltr" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>حالة الفعالية</FormLabel>
												<FormControl>
													<Select
														dir="rtl"
														value={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="اختر الحالة" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="active">جارية</SelectItem>
															<SelectItem value="upcoming">قادمة</SelectItem>
															<SelectItem value="finished">منتهية</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Description */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">وصف الفعالية</h3>

									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea
														placeholder="أضف وصفاً للفعالية هنا..."
														className="min-h-[100px]"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
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

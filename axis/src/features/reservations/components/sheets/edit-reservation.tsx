import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	IconCalendar,
	IconClock,
	IconEdit,
	IconMapPin,
	IconPhone,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import type * as React from "react";

import type { schema } from "../cafe-reservations-table";
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

// Define form schema for editing reservations
const reservationFormSchema = z.object({
	guestName: z.string().min(2, { message: "اسم الضيف مطلوب" }),
	phoneNumber: z.string().min(10, { message: "رقم الهاتف غير صحيح" }),
	area: z.string().min(1, { message: "المنطقة مطلوبة" }),
	guestCount: z
		.number()
		.min(1, { message: "عدد الضيوف يجب أن يكون 1 على الأقل" }),
	status: z.string(),
	reservationDate: z.string(),
	reservationTime: z.string(),
	specialRequests: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationFormSchema>;

interface EditReservationSheetProps {
	reservation: z.infer<typeof schema>;
	onSuccess?: () => void;
}

export function EditReservationSheet({
	reservation,
	onSuccess,
}: EditReservationSheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	// Initialize form with reservation data
	const form = useForm<ReservationFormValues>({
		resolver: zodResolver(reservationFormSchema),
		defaultValues: {
			guestName: reservation.guestName,
			phoneNumber: reservation.phoneNumber,
			area: reservation.area,
			guestCount: reservation.guestCount,
			status: reservation.status,
			reservationDate: "2025-04-05", // Mock date, should come from API
			reservationTime: "19:30", // Mock time, should come from API
			specialRequests: reservation.specialRequests || "",
		},
	});

	// Available areas for selection
	const areas = [
		"القاعة الأساسية",
		"قاعة الملكية",
		"القاعة الرئيسية",
		"قاعة VIP",
	];

	// Handle form submission
	const onSubmit = async (data: ReservationFormValues) => {
		try {
			setIsPending(true);

			// Mock API call - replace with your actual update API
			await new Promise((resolve) => setTimeout(resolve, 800));

			toast.success(`تم تحديث حجز "${data.guestName}" بنجاح`);
			setIsOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error("حدث خطأ أثناء تحديث الحجز", {
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
						تعديل معلومات الحجز
					</SheetTitle>
					<SheetDescription>
						رقم الحجز: <span className="font-mono">{reservation.id}</span>
					</SheetDescription>
				</SheetHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea dir="rtl" className="h-[calc(100vh-12rem)]">
							<div className="px-6 py-4 space-y-6">
								{/* Customer Information */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">معلومات العميل</h3>

									<FormField
										control={form.control}
										name="guestName"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconUser className="size-4" />
													اسم الضيف
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
										name="phoneNumber"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconPhone className="size-4" />
													رقم الهاتف
												</FormLabel>
												<FormControl>
													<Input {...field} dir="ltr" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Reservation Details */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">تفاصيل الحجز</h3>

									<FormField
										control={form.control}
										name="area"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconMapPin className="size-4" />
													المنطقة
												</FormLabel>
												<FormControl>
													<Select
														dir="rtl"
														value={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="اختر المنطقة" />
														</SelectTrigger>
														<SelectContent>
															{areas.map((area) => (
																<SelectItem key={area} value={area}>
																	{area}
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
										name="guestCount"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconUsers className="size-4" />
													عدد الضيوف
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

									<FormField
										control={form.control}
										name="reservationDate"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconCalendar className="size-4" />
													التاريخ
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
										name="reservationTime"
										render={({ field }) => (
											<FormItem className="space-y-0">
												<FormLabel className="gap-1">
													<IconClock className="size-4" />
													الوقت
												</FormLabel>
												<FormControl>
													<Input type="time" {...field} />
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
												<FormLabel>حالة الحجز</FormLabel>
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
															<SelectItem value="confirmed">مؤكد</SelectItem>
															<SelectItem value="pending">
																قيد الانتظار
															</SelectItem>
															<SelectItem value="cancelled">ملغي</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Separator />

								{/* Special Requests */}
								<div className="space-y-4">
									<h3 className="text-sm font-semibold mb-3">طلبات خاصة</h3>

									<FormField
										control={form.control}
										name="specialRequests"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea
														placeholder="أضف أي طلبات خاصة هنا..."
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

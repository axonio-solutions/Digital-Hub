import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cafesQueries } from "@/features/setup/components/information/informations.queries";
import {
	updateMaxCapacityFn,
	updateSeatingSettingsFn,
} from "@/fn/seating-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import Section from "../section";
import {
	type BookingSettingsFormValues,
	bookingSettingsSchema,
} from "./validation";

const timeBlocks = [
	{ value: "1", label: "1 ساعة" },
	{ value: "1.5", label: "1.5 ساعة" },
	{ value: "2", label: "2 ساعات" },
	{ value: "2.5", label: "2.5 ساعات" },
	{ value: "3", label: "3 ساعات" },
	{ value: "3.5", label: "3.5 ساعات" },
];

export const SpaceSettings = () => {
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery(cafesQueries.space());
	const [maxCapacity, setMaxCapacity] = useState(1);

	const form = useForm<BookingSettingsFormValues>({
		resolver: zodResolver(bookingSettingsSchema),
		defaultValues: {
			advance_booking_window: 0,
			booking_duration: 0,
			cancellation_policy: "",
		},
	});

	const isDirty = form.formState.isDirty;

	const maxCapacityMutation = useMutation({
		mutationFn: (data: number) => updateMaxCapacityFn({ data }),
		onMutate: async (newValue) => {
			await queryClient.cancelQueries(cafesQueries.space());
			const previousData = queryClient.getQueryData(
				cafesQueries.space().queryKey,
			);
			if (previousData) {
				queryClient.setQueryData(cafesQueries.space().queryKey, {
					...previousData,
					max_capacity: newValue,
				});
			}
			toast.success("تم تعديل السعة القُصوى بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafesQueries.space().queryKey,
				context?.previousData,
			);
			toast.error("حدث مُشكل أثناء تحديث السعة القُصوى");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: cafesQueries.space().queryKey,
			}),
	});

	const seatingSettingsMutation = useMutation({
		mutationFn: (updates: BookingSettingsFormValues) =>
			updateSeatingSettingsFn({ data: updates }),
		onMutate: async (updates) => {
			await queryClient.cancelQueries(cafesQueries.space());
			const previousData = queryClient.getQueryData(
				cafesQueries.space().queryKey,
			);
			if (previousData) {
				queryClient.setQueryData(cafesQueries.space().queryKey, {
					...previousData,
					advance_booking_window: updates.advance_booking_window,
					booking_duration: updates.booking_duration,
					cancellation_policy: updates.cancellation_policy,
				});
			}
			toast.success("تم تعديل إعدادت الحجز بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafesQueries.space().queryKey,
				context?.previousData,
			);
			toast.error("حدث مُشكل أثناء تعديل إعدادات الحجز");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: cafesQueries.details().queryKey,
			}),
	});

	const onSubmit: SubmitHandler<BookingSettingsFormValues> = async (data) => {
		seatingSettingsMutation.mutate(data);
	};

	useEffect(() => {
		if (data && !isLoading) {
			setMaxCapacity(data.max_capacity ?? 1);
			form.reset({
				advance_booking_window: data.advance_booking_window as number,
				booking_duration: data.booking_duration as number,
				cancellation_policy: data.cancellation_policy as string,
			});
		}
	}, [data, form, isLoading]);

	return (
		<div className="space-y-8" dir="rtl">
			{/* Max Capacity Section */}
			<Section
				title="السعة القصوى"
				description="حدد السعة القصوى لمقهاك بشكل إجمالي. هذا الرقم يساعد في تنظيم الحجوزات وضمان تجربة مريحة لجميع الزوار مع الحفاظ على جودة الخدمة"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<Alert className="bg-blue-50 border-blue-200">
						<AlertDescription className="text-blue-700">
							تمثل هذه السعة الحد الأقصى الذي يستطيع المقهى استيعابه، وسيتم
							استخدامها كقيود عند إعداد الطاولات والمناطق.
						</AlertDescription>
					</Alert>
					<div className="space-y-4 mt-6">
						<div>
							<h3 className="text-sm leading-none font-medium mb-2">
								السعة القصوى
							</h3>
							{isLoading ? (
								<Skeleton className="h-9 w-full border" />
							) : (
								<NumberInputWithMinsPlusButtons
									min={1}
									max={1000}
									value={maxCapacity}
									onChange={setMaxCapacity}
								/>
							)}
						</div>

						<Button
							className="w-full"
							onClick={() => maxCapacityMutation.mutate(maxCapacity)}
							disabled={
								maxCapacityMutation.isPending ||
								maxCapacity === data?.max_capacity
							}
						>
							تحديث السعة
						</Button>
					</div>
				</div>
			</Section>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Reservation Settings */}
					<Section
						title="إعدادات الحجز"
						description="اضبط قواعد وسياسات الحجز في مقهاك وذلك لضمان تجربة سلسة للحجز وتنظيم المساحات واضبط القيود الزمنية للحجز بشكل يناسب في تنظيم عملية الحجز وتحسين تجربة العملاء"
					>
						<div className="w-full flex-1 rounded-lg border p-6">
							<div className="space-y-6">
								{/* Max Reservation Days */}
								<FormField
									control={form.control}
									name="advance_booking_window"
									render={({ field }) => (
										<FormItem>
											<FormLabel>الحد الزمني للحجز المُسبق</FormLabel>
											<FormControl>
												{isLoading ? (
													<Skeleton className="h-9 w-full border" />
												) : (
													<NumberInputWithMinsPlusButtons
														min={1}
														value={field.value}
														onChange={field.onChange}
														suffix="أيام"
													/>
												)}
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Reservation Duration Options */}
								<FormField
									control={form.control}
									name="booking_duration"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<div>
												<FormLabel>مُدة الحجز الافتراضية</FormLabel>
												<p className="text-sm text-muted-foreground mt-1">
													حدد المدة الافتراضية لحجوزات العملاء
												</p>
											</div>
											<div className="space-y-4">
												{/* Preset Durations */}
												<RadioGroup
													dir="rtl"
													className="grid grid-cols-3 gap-2"
													value={(field.value / 60).toString()}
													onValueChange={(value) =>
														field.onChange(Number(value) * 60)
													}
												>
													{timeBlocks.map((item) => (
														// biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
														<label
															key={`duration-${item.value}`}
															className="relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-input px-2 py-3 text-center shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-disabled]]:cursor-not-allowed has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-ring/70"
														>
															<RadioGroupItem
																value={item.value}
																className="sr-only after:absolute after:inset-0"
															/>
															<p className="text-sm font-medium leading-none text-foreground">
																{item.label}
															</p>
														</label>
													))}
												</RadioGroup>

												{/* Custom Duration Input */}
												<div>
													<span className="text-sm text-muted-foreground mb-2 block">
														أو أدخل مدة مخصصة
													</span>
													{isLoading ? (
														<Skeleton className="h-9 w-full border" />
													) : (
														<NumberInputWithMinsPlusButtons
															min={0.5}
															max={4}
															value={field.value / 60}
															onChange={(value) => field.onChange(value * 60)}
															suffix="ساعات"
														/>
													)}
												</div>
											</div>
										</FormItem>
									)}
								/>

								{/* Cancellation Policy */}
								<FormField
									control={form.control}
									name="cancellation_policy"
									render={({ field }) => (
										<FormItem>
											<FormLabel>سياسة الإلغاء و الإسترداد</FormLabel>
											<FormControl>
												{isLoading ? (
													<Skeleton className="min-h-32 w-full border" />
												) : (
													<Textarea
														placeholder="أدخل سياسة الإلغاء..."
														className="min-h-32"
														{...field}
													/>
												)}
											</FormControl>
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={seatingSettingsMutation.isPending || !isDirty}
								>
									حفظ التغييرات
								</Button>
							</div>
						</div>
					</Section>
				</form>
			</Form>
		</div>
	);
};

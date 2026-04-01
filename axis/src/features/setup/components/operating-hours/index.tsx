import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { operatingHoursQueries } from "./lib/queries";
import { DAY_TRANSLATIONS } from "./lib/types";
import TimeInput from "./time-select";
import type { OperatingHoursData, OperatingHoursFormData } from "./lib/types";
import { updateCafeOperatingHoursFn } from "@/fn/cafe";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const defaultOperatingHours: OperatingHoursData = {
	SUNDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	MONDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	TUESDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	WEDNESDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	THURSDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	FRIDAY: {
		enabled: true,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
	SATURDAY: {
		enabled: false,
		timeSlots: [{ from: "09:00", to: "17:00" }],
	},
};

const OperatingHours = () => {
	const queryClient = useQueryClient();
	const { data: fetchedHours, isLoading } = useQuery(
		operatingHoursQueries.list(),
	);

	const [schedule, setSchedule] = useState<OperatingHoursData>(
		defaultOperatingHours,
	);
	const isRTL = true;

	useEffect(() => {
		if (fetchedHours) {
			setSchedule(fetchedHours);
		}
	}, [fetchedHours]);

	const handleToggleDay = (day: keyof OperatingHoursData) => {
		setSchedule((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				enabled: !prev[day].enabled,
			},
		}));
	};

	const handleTimeChange = (
		day: keyof OperatingHoursData,
		slotIndex: number,
		field: "from" | "to",
		value: string,
	) => {
		setSchedule((prev) => {
			const newSchedule = { ...prev };
			if (newSchedule[day]?.timeSlots[slotIndex]) {
				newSchedule[day].timeSlots[slotIndex][field] = value;
			}
			return newSchedule;
		});
	};

	const removeTimeSlot = (day: keyof OperatingHoursData, slotIndex: number) => {
		setSchedule((prev) => {
			const newSchedule = { ...prev };
			if (newSchedule[day]?.timeSlots) {
				newSchedule[day].timeSlots = newSchedule[day].timeSlots.filter(
					(_, index) => index !== slotIndex,
				);
			}
			return newSchedule;
		});
	};

	const addTimeSlot = (day: keyof OperatingHoursData) => {
		setSchedule((prev) => {
			const newSchedule = JSON.parse(JSON.stringify(prev));
			if (newSchedule[day] && Array.isArray(newSchedule[day].timeSlots)) {
				newSchedule[day].timeSlots.push({ from: "09:00", to: "17:00" });
			}
			return newSchedule;
		});
	};

	const operatingHoursMutation = useMutation({
		mutationFn: (updates: OperatingHoursData) =>
			updateCafeOperatingHoursFn({ data: updates as OperatingHoursFormData }),
		onMutate: async (updates) => {
			await queryClient.cancelQueries(operatingHoursQueries.list());
			const previousData = queryClient.getQueryData<OperatingHoursData>(
				operatingHoursQueries.list().queryKey,
			);

			if (previousData) {
				queryClient.setQueryData<OperatingHoursData>(
					operatingHoursQueries.list().queryKey,
					updates,
				);
			}

			toast.success("تم تعديل ساعات العمل بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(
					operatingHoursQueries.list().queryKey,
					context.previousData,
				);
			}
			toast.error("حدث مُشكل أثناء تعديل ساعات العمل");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: operatingHoursQueries.list().queryKey,
			}),
	});

	const saveChanges = () => {
		operatingHoursMutation.mutate(schedule);
	};

	return (
		<div className="flex flex-col gap-4 w-full px-0 sm:px-4">
			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 7 }).map((_, index) => (
						<div
							key={`loading-${
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								index
							}`}
							className="rounded-lg bg-gray-50/50 p-4 transition-colors hover:bg-gray-50/80 border border-input animate-pulse"
						>
							<div className="flex items-center justify-between">
								<div className="h-5 w-24 bg-gray-200 rounded" />
								<div className="h-5 w-10 bg-gray-200 rounded" />
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-3">
					{Object.entries(schedule).map(([day, { enabled, timeSlots }]) => (
						<div
							key={day}
							className="rounded-lg bg-gray-50/50 p-4 transition-colors hover:bg-gray-50/80 border border-input"
						>
							<div className="flex items-center justify-between">
								<h3 className="text-base font-medium">
									{DAY_TRANSLATIONS[day]}
								</h3>
								<Switch
									dir="ltr"
									checked={enabled}
									onCheckedChange={() =>
										handleToggleDay(day as keyof OperatingHoursData)
									}
								/>
							</div>

							<AnimatePresence mode="wait">
								{enabled && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ type: "spring", bounce: 0, duration: 0.3 }}
									>
										<div className="mt-4 space-y-4">
											{timeSlots.map((slot, index) => (
												<motion.div
													key={`${day}-slot-${
														// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
														index
													}`}
													initial={{ x: -20, opacity: 0 }}
													animate={{ x: 0, opacity: 1 }}
													exit={{ x: -20, opacity: 0 }}
													className="flex items-center gap-2"
												>
													<div className="flex items-start gap-4 flex-1">
														<div className="flex-1">
															<TimeInput
																label="من"
																dir={isRTL ? "rtl" : "ltr"}
																value={slot.from}
																onChange={(value) =>
																	handleTimeChange(
																		day as keyof OperatingHoursData,
																		index,
																		"from",
																		value,
																	)
																}
															/>
														</div>
														<div className="flex-1">
															<TimeInput
																dir={isRTL ? "rtl" : "ltr"}
																label="إلى"
																value={slot.to}
																onChange={(value) =>
																	handleTimeChange(
																		day as keyof OperatingHoursData,
																		index,
																		"to",
																		value,
																	)
																}
															/>
														</div>
													</div>
													{timeSlots.length > 1 && (
														<Button
															variant="secondary"
															size="icon"
															onClick={() =>
																removeTimeSlot(
																	day as keyof OperatingHoursData,
																	index,
																)
															}
															className="h-8 w-8 mt-6 cursor-pointer border"
														>
															<X className="h-4 w-4" />
														</Button>
													)}
												</motion.div>
											))}
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													addTimeSlot(day as keyof OperatingHoursData)
												}
												className="w-full cursor-pointer"
											>
												<Plus className="h-4 w-4 mr-2" />
												إضافة فترة جديدة
											</Button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</div>
			)}

			<Button
				className="w-full"
				onClick={saveChanges}
				disabled={operatingHoursMutation.isPending || isLoading}
			>
				حفظ ساعات العمل
			</Button>
		</div>
	);
};

export default OperatingHours;

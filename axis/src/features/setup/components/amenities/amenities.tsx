import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useState } from "react";
import {
	Header,
	ListBox,
	ListBoxItem,
	ListBoxSection,
	Separator,
} from "react-aria-components";
import { type SubmitHandler, useForm } from "react-hook-form";

import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import Section from "@/features/spaces/components/section";
import { updateAmenitiesFn } from "@/fn/amenties";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cafesQueries } from "../information/informations.queries";
import {
	type CafeAmenities,
	amenitiesSchema,
} from "../information/informations.validation";

const amenitySections = [
	{
		id: "basic",
		title: "المرافق الأساسية",
		items: [
			{ id: "wifi", label: "واي فاي" },
			{ id: "power_outlets", label: "مقابس كهربائية" },
			{ id: "outdoor_seating", label: "جلسات خارجية" },
			{ id: "air_conditioning", label: "تكييف" },
			{ id: "parking", label: "موقف سيارات" },
		],
	},
	{
		id: "services",
		title: "الخدمات",
		items: [
			{ id: "takeaway", label: "طلبات خارجية" },
			{ id: "reservations", label: "حجوزات" },
			{ id: "delivery", label: "توصيل" },
		],
	},
	{
		id: "features",
		title: "مرافق أخرى",
		items: [
			{ id: "group_friendly", label: "مناسب للمجموعات" },
			{ id: "pet_friendly", label: "مسموح بالحيوانات الأليفة" },
			{ id: "student_discount", label: "خصم للطلاب" },
			{ id: "loyalty_program", label: "برنامج ولاء" },
			{ id: "board_games", label: "ألعاب لوحية" },
			{ id: "live_music", label: "موسيقى حية" },
		],
	},
];

const AmenitiesForm = () => {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData(cafesQueries.details().queryKey)
		?.amenities as CafeAmenities;

	const form = useForm<CafeAmenities>({
		resolver: zodResolver(amenitiesSchema),
		defaultValues: data,
	});

	const isDirty = form.formState.isDirty;
	const [inputValue, setInputValue] = useState<string>("");
	const [customAmenities, setCustomAmenities] = useState<string[]>(() => {
		const custom = [];
		if (data?.amenities?.custom) {
			for (const [key, value] of Object.entries(data.amenities.custom)) {
				if (value) custom.push(key);
			}
		}
		return custom;
	});

	const handleCustomAmenityKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();

			const newCustomAmenity = inputValue.trim();
			if (!customAmenities.includes(newCustomAmenity)) {
				const updatedCustomAmenities = [...customAmenities, newCustomAmenity];
				setCustomAmenities(updatedCustomAmenities);

				const currentData = form.getValues();
				const updatedAmenities = {
					...currentData.amenities,
					custom: {
						...currentData.amenities.custom,
					},
				};

				updatedAmenities.custom[newCustomAmenity] = true;

				form.setValue("amenities", updatedAmenities);
			}

			setInputValue("");
		}
	};

	const handleRemoveCustomAmenity = (amenityToRemove: string) => {
		const updatedCustomAmenities = customAmenities.filter(
			(amenity) => amenity !== amenityToRemove,
		);
		setCustomAmenities(updatedCustomAmenities);

		const currentData = form.getValues();
		const updatedAmenities = {
			...currentData.amenities,
			custom: {
				...currentData.amenities.custom,
			},
		};

		delete updatedAmenities.custom[amenityToRemove];

		form.setValue("amenities", updatedAmenities);
	};

	const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
		() => {
			const selected = new Set<string>();
			if (data?.amenities) {
				for (const [key, value] of Object.entries(data.amenities.basic || {})) {
					if (value) selected.add(key);
				}
				for (const [key, value] of Object.entries(
					data.amenities.services || {},
				)) {
					if (value) selected.add(key);
				}
				for (const [key, value] of Object.entries(
					data.amenities.features || {},
				)) {
					if (value) selected.add(key);
				}
			}
			return selected;
		},
	);

	const handleSelectionChange = (keys: Set<string>) => {
		setSelectedAmenities(keys);

		const currentData = form.getValues();
		const updatedAmenities = {
			...currentData.amenities,
		};

		for (const key of Object.keys(updatedAmenities.basic)) {
			updatedAmenities.basic[key] = keys.has(key);
		}

		for (const key of Object.keys(updatedAmenities.services)) {
			updatedAmenities.services[key] = keys.has(key);
		}

		for (const key of Object.keys(updatedAmenities.features)) {
			updatedAmenities.features[key] = keys.has(key);
		}

		form.setValue("amenities", updatedAmenities);
	};

	const { mutate: updateAmenities, isPending } = useMutation({
		mutationFn: (data: CafeAmenities) => updateAmenitiesFn({ data }),
		onMutate: async (newAmenities) => {
			await queryClient.cancelQueries({
				queryKey: cafesQueries.details().queryKey,
			});

			const previousData = queryClient.getQueryData(
				cafesQueries.details().queryKey,
			);

			queryClient.setQueryData(cafesQueries.details().queryKey, (old) => {
				return {
					...old,
					amenities: newAmenities,
				};
			});

			toast.success("تم تحديث المرافق بنجاح");

			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafesQueries.details().queryKey,
				context?.previousData,
			);

			toast.error("حدث خطأ أثناء تحديث المرافق. يرجى المحاولة مرة أخرى.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: cafesQueries.details().queryKey,
			});
		},
	});

	const onSubmit: SubmitHandler<CafeAmenities> = async (data) => {
		updateAmenities(data);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				{/* Amenities Selection */}
				<div className="space-y-2">
					<Label className="text-right">المرافق المتوفرة</Label>
					<ScrollArea className="h-[350px] w-full rounded-lg border border-input">
						<ListBox
							className="space-y-2 bg-background p-2 text-sm text-right cursor-pointer"
							selectionMode="multiple"
							selectedKeys={selectedAmenities}
							onSelectionChange={handleSelectionChange}
						>
							{amenitySections.map((section) => (
								<Fragment key={section.id}>
									<ListBoxSection className="space-y-1">
										<Header className="px-2 py-1.5 text-xs font-medium text-muted-foreground text-right">
											{section.title}
										</Header>
										{section.items.map((item) => (
											<ListBoxItem
												key={item.id}
												id={item.id}
												className="relative rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-right"
											>
												{item.label}
											</ListBoxItem>
										))}
									</ListBoxSection>
									{section.id !==
										amenitySections[amenitySections.length - 1].id && (
										<Separator className="my-2" />
									)}
								</Fragment>
							))}
						</ListBox>
					</ScrollArea>
				</div>

				{/* Custom Amenities Input */}
				<FormField
					control={form.control}
					name="amenities.custom"
					render={() => (
						<FormItem className="space-y-1">
							<FormLabel className="block">مرافق أخرى</FormLabel>
							<FormControl>
								<Input
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={handleCustomAmenityKeyDown}
									placeholder="أضف مرافق اخرى"
								/>
							</FormControl>
							{form.watch("amenities.custom") && (
								<div className="flex flex-wrap gap-2">
									{Object.entries(form.watch("amenities.custom")).map(
										([amenity, isActive]) =>
											isActive ? (
												<div
													key={amenity}
													className="bg-muted border px-3 py-1 rounded-lg text-sm flex items-center gap-1"
												>
													{amenity}
													<Button
														variant="ghost"
														className="size-2 cursor-pointer hover:text-red-500"
														onClick={() => handleRemoveCustomAmenity(amenity)}
													>
														<IconTrash className="size-4" />
													</Button>
												</div>
											) : null,
									)}
								</div>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* WiFi Details */}
				{selectedAmenities.has("wifi") && (
					<div className="space-y-4 p-4 bg-muted/30 border border-input rounded-lg text-right">
						<h4 className="font-medium">تفاصيل الواي فاي</h4>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="details.wifi.speed"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>سرعة الواي فاي</FormLabel>
										<FormControl>
											<NumberInputWithMinsPlusButtons
												min={0}
												value={field.value || 0}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				)}

				{/* Reservation Details */}
				{selectedAmenities.has("reservations") && (
					<div className="space-y-4 p-4 bg-muted/30 border border-input rounded-lg text-right">
						<h4 className="font-medium">تفاصيل الحجوزات</h4>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="details.reservations.min_group_size"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>الحد الأدنى للمجموعة</FormLabel>
										<FormControl>
											<NumberInputWithMinsPlusButtons
												min={1}
												value={field.value || 1}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="details.reservations.max_group_size"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>الحد الأقصى للمجموعة</FormLabel>
										<FormControl>
											<NumberInputWithMinsPlusButtons
												min={1}
												value={field.value || 10}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				)}

				<Button
					type="submit"
					className="w-full"
					disabled={isPending || !isDirty}
				>
					حفظ المرافق
				</Button>
			</form>
		</Form>
	);
};

export const AmenitiesTabContent = () => {
	return (
		<TabsContent value="amenities" className="flex flex-col px-4 lg:px-6">
			<Section
				title="المرافق والتجهيزات"
				description="حدد المرافق والتجهيزات المتوفرة في مقهاك لمساعدة العملاء في العثور على المكان المناسب لهم. كلما كانت المعلومات دقيقة زادت فرص جذب العملاء المرتقبين"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<AmenitiesForm />
				</div>
			</Section>
		</TabsContent>
	);
};

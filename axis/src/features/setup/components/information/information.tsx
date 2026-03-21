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
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { VirtualizedCombobox } from "@/components/virtualized-combobox";
import citiesLite from "@/data/cities_lite.json";
import regionsData from "@/data/regions_lite.json";
import Section from "@/features/spaces/components/section";
import { updateCafeInformationFn } from "@/fn/cafe";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CafeCategoriesSelector } from "../cafe-categories-selector/cafe-categories-selector";
import { cafeCategoriesQueries } from "../cafe-categories-selector/cafe-categories.queries";
import { CafeTypeSelector } from "../cafe-type-selector/cafe-type-selector";
import { cafeTypesQueries } from "../cafe-type-selector/cafe-types.queries";
import OperatingHours from "../operating-hours";
import {
	formatCafeSlug,
	preprocessLocationData,
	transformCafeToFormValues,
} from "./information.helpers";
import { cafesQueries } from "./informations.queries";
import type {
	CafeInformationFormValues,
	CafeSelectWithCategories,
} from "./informations.types";
import { cafeInformationFormSchema } from "./informations.validation";
import { PictureUploader } from "./picture-uploader";

const CafeInformationForm = () => {
	const { data: cafeDetails, isLoading: loadingCafeDetails } = useQuery(
		cafesQueries.details(),
	);
	const { data: cafeTypes, isLoading: loadingCafeTypes } = useQuery(
		cafeTypesQueries.list(),
	);
	const { data: cafeCategories, isLoading: loadingCafeCategories } = useQuery(
		cafeCategoriesQueries.list(),
	);

	const queryClient = useQueryClient();

	const form = useForm<CafeInformationFormValues>({
		resolver: zodResolver(cafeInformationFormSchema),
		defaultValues: {
			name_ar: "",
			name_en: "",
			slug: "",
			description: "",
			administrative_region: "",
			street: "",
			governorate: "",
			categories: [],
		},
	});

	const isDirty = form.formState.isDirty;
	const [selectedRegion, setSelectedRegion] = useState<string>("");

	const { regions, citiesByRegion } = useMemo(
		() => preprocessLocationData(regionsData, citiesLite),
		[],
	);

	const governorateOptions = useMemo(() => {
		const governorates = citiesByRegion[selectedRegion] || [];
		return governorates.map((gov) => gov.name);
	}, [selectedRegion, citiesByRegion]);

	useEffect(() => {
		if (cafeDetails && !loadingCafeDetails) {
			const formValues = transformCafeToFormValues(cafeDetails); // TODO: enhance the name since I map more than transform
			form.reset(formValues);

			if (cafeDetails.administrative_region) {
				setSelectedRegion(cafeDetails.administrative_region.toString());
			}
		}
	}, [cafeDetails, loadingCafeDetails, form]);

	const cafeInformationMutation = useMutation({
		mutationFn: (updates: CafeInformationFormValues) =>
			updateCafeInformationFn({ data: updates }),
		onMutate: async (updates) => {
			await queryClient.cancelQueries(cafesQueries.details());
			const previousData = queryClient.getQueryData<CafeSelectWithCategories>(
				cafesQueries.details().queryKey,
			);
			if (previousData) {
				queryClient.setQueryData<CafeSelectWithCategories>(
					cafesQueries.details().queryKey,
					{
						...previousData,
						name_ar: updates.name_ar,
						name_en: updates.name_en,
						slug: updates.slug,
						description: updates.description || null,
						administrative_region: updates.administrative_region || null,
						governorate: updates.governorate || null,
						street: updates.street || null,
						type_id: updates.type_id,
					},
				);
			}
			toast.success("تم تعديل بيانات المقهى بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafesQueries.details().queryKey,
				context?.previousData,
			);
			toast.error("حدث مُشكل أثناء تعديل البيانات");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: cafesQueries.details().queryKey,
			}),
	});

	const onSubmit: SubmitHandler<CafeInformationFormValues> = async (data) => {
		cafeInformationMutation.mutate(data);
	};

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-4 w-full sm:px-4"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{/* <div>
					<div className="mb-2">
						<h4 className="text-base font-medium">شعار المقهى</h4>
						<p className="text-sm">قم برفع شعار المقهى الخاص بك</p>
					</div>
					<PictureUploader initialPicture={initialData.banner_image_url} />
				</div> */}

				<FormField
					control={form.control}
					name="name_ar"
					render={({ field }) => (
						<FormItem className="space-y-0 gap-1">
							<FormLabel className="text-base font-medium">
								اسم المقهى (بالعربية)
							</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-9 w-full border" />
								) : (
									<Input {...field} placeholder="أدخل اسم المقهى بالعربية" />
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="name_en"
					render={({ field }) => (
						<FormItem className="space-y-0 gap-1">
							<FormLabel className="text-base font-medium">
								اسم المقهى (بالإنجليزية)
							</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-9 border w-full" />
								) : (
									<Input {...field} placeholder="أدخل اسم المقهى بالإنجليزية" />
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="slug"
					render={({ field: { onChange, ...field } }) => (
						<FormItem className="space-y-0 gap-1">
							<FormLabel className="text-base font-medium">
								رابط الصفحة العامة
							</FormLabel>
							<p className="text-sm">
								سيكون هذا جزءاً من عنوان موقع مقهاك الذي يمكن للعملاء زيارته
							</p>
							<FormControl className="py-1">
								{loadingCafeDetails ? (
									<Skeleton className="h-9 border w-full" />
								) : (
									<div className="relative" dir="ltr">
										<Input
											className="peer ps-4 sm:ps-42"
											placeholder="cafe-name"
											type="text"
											{...field}
											onKeyDown={(e) => {
												if (e.key === " ") {
													e.preventDefault();
													onChange(`${field.value}-`);
												}
											}}
											onChange={(e) => {
												const value = e.target.value;
												const formatedValue = formatCafeSlug(value);
												onChange(formatedValue);
											}}
											onBlur={(e) => {
												const value = e.target.value;
												const formatedValue = formatCafeSlug(value, true);
												onChange(formatedValue);
											}}
										/>
										<span className="pointer-events-none absolute inset-y-0 start-0 hidden sm:flex items-center ps-3 text-xs sm:text-sm peer-disabled:opacity-50 text-zinc-700">
											https://coffeeshops.com/
										</span>
									</div>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem className="space-y-0 gap-1">
							<FormLabel className="text-base font-medium">
								وصف المقهى
							</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-24 border w-full" />
								) : (
									<Textarea
										{...field}
										placeholder="أدخل وصفاً مختصراً عن المقهى"
										className="min-h-24"
									/>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="administrative_region"
					render={({ field }) => (
						<FormItem className="space-y-0 flex flex-col">
							<FormLabel>المنطقة الإدارية</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-9 border w-full" />
								) : (
									<VirtualizedCombobox
										options={regions}
										searchPlaceholder="ابحث عن المنطقة"
										selectedOption={
											regionsData.find(
												(region) => region.region_id.toString() === field.value,
											)?.name_ar || ""
										}
										onSelect={(regionName) => {
											const regionId = regionsData
												.find((region) => region.name_ar === regionName)
												?.region_id.toString();
											if (regionId) {
												field.onChange(regionId);
												setSelectedRegion(regionId);
												form.setValue("governorate", "");
											}
										}}
									/>
								)}
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="governorate"
					render={({ field }) => (
						<FormItem className="space-y-0 flex flex-col">
							<FormLabel>المحافظة</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-9 border w-full" />
								) : (
									<VirtualizedCombobox
										options={governorateOptions}
										searchPlaceholder="ابحث عن المحافظة"
										selectedOption={
											citiesByRegion[selectedRegion]?.find(
												(city) => city.id === field.value,
											)?.name || ""
										}
										onSelect={(cityName) => {
											const cityId = citiesByRegion[selectedRegion]?.find(
												(city) => city.name === cityName,
											)?.id;
											field.onChange(cityId);
										}}
										disabled={!selectedRegion}
									/>
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="street"
					render={({ field }) => (
						<FormItem className="space-y-0 gap-1">
							<FormLabel className="text-base font-medium">العنوان</FormLabel>
							<FormControl>
								{loadingCafeDetails ? (
									<Skeleton className="h-9 border w-full" />
								) : (
									<Input {...field} placeholder="أدخل عنوان الشارع" />
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type_id"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel className="text-base font-medium">
								نوع المقهى
							</FormLabel>
							<FormControl>
								<CafeTypeSelector
									value={field.value}
									onChange={field.onChange}
									data={cafeTypes}
									isLoading={loadingCafeTypes}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="categories"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<div>
								<FormLabel className="text-base font-medium">
									<span>تصنيف المقهى</span>
								</FormLabel>
								<p className="text-sm text-muted-foreground">
									اختر حتى 3 تصنيفات تصف مقهاك بشكل أفضل
								</p>
							</div>
							<FormControl>
								<CafeCategoriesSelector
									value={field.value}
									onChange={field.onChange}
									data={cafeCategories}
									isLoading={loadingCafeCategories}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full cursor-pointer"
					disabled={!isDirty || cafeInformationMutation.isPending}
				>
					حفظ المعلومات
				</Button>
			</form>
		</Form>
	);
};

export const InformationTabContent = () => {
	return (
		<TabsContent
			value="information"
			className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
		>
			<Section
				title="المعلومات الأساسية"
				description="استخدم هذا القسم لتحديث المعلومات الأساسية لمقهاك..."
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<CafeInformationForm />
				</div>
			</Section>

			<Section
				title="ساعات العمل"
				description="حدد أوقات العمل المعتادة للمقهى..."
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<OperatingHours />
				</div>
			</Section>
		</TabsContent>
	);
};

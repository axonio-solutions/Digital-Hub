import { zodResolver } from "@hookform/resolvers/zod";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {  useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeleteAreaDialog } from "./delete-area-modal";
import { seatingAreasQueries } from "./seating-areas.queries";
import type { Area, AreaFormValues } from "./seating-areas.types";
import { areaSchema, type updateAreaSchema } from "./seating-areas.validations";
import type {SubmitHandler} from "react-hook-form";
import type { z } from "zod";
import { createSeatingAreaFn, updateSeatingAreaFn } from "@/fn/seating-areas";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";

const DEFAULT_FORM_VALUES: AreaFormValues = {
	name_ar: "",
	name_en: "",
	capacity: 1,
	base_price: 0,
};

export const AreaManagementForm = () => {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editedAreaId, setEditedAreaId] = useState<string>("");

	const { data: areas, isLoading } = useQuery(seatingAreasQueries.list());

	const form = useForm<AreaFormValues>({
		resolver: zodResolver(areaSchema),
		defaultValues: DEFAULT_FORM_VALUES,
	});

	const createAreaMutation = useMutation({
		mutationFn: (values: AreaFormValues) =>
			createSeatingAreaFn({ data: values }),
		onMutate: async (newArea) => {
			await queryClient.cancelQueries(seatingAreasQueries.list());
			const previousAreas = queryClient.getQueryData<Array<Area>>(
				seatingAreasQueries.list().queryKey,
			);

			queryClient.setQueryData(
				seatingAreasQueries.list().queryKey,
				(old: Array<Area> = []) => {
					const optimisticArea = {
						id: `temp-id-${Date.now()}`,
						name_ar: newArea.name_ar,
						name_en: newArea.name_en,
						capacity: newArea.capacity,
						base_price: newArea.base_price.toString(),
					};
					return [...old, optimisticArea];
				},
			);

			toast.success("تم إضافة المنطقة بنجاح");
			form.reset();
			return { previousAreas };
		},
		onError: (_, __, context) => {
			console.log("onError");
			queryClient.setQueryData(
				seatingAreasQueries.list().queryKey,
				context?.previousAreas,
			);
			toast.error("فشل إضافة المنطقة");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: seatingAreasQueries.list().queryKey,
			});
		},
	});

	const updateSeatingAreaMutation = useMutation({
		mutationFn: (updates: z.infer<typeof updateAreaSchema>) =>
			updateSeatingAreaFn({ data: updates }),
		onMutate: async (updatedArea) => {
			await queryClient.cancelQueries(seatingAreasQueries.list());
			const previousAreas = queryClient.getQueryData<Array<Area>>(
				seatingAreasQueries.list().queryKey,
			);

			if (previousAreas) {
				queryClient.setQueryData(
					seatingAreasQueries.list().queryKey,
					previousAreas.map((area) =>
						area.id === updatedArea.id
							? {
									...area,
									name_ar: updatedArea.name_ar,
									name_en: updatedArea.name_en,
									capacity: updatedArea.capacity,
									base_price: updatedArea.base_price.toString(),
								}
							: area,
					),
				);
			}

			toast.success("تم تعديل معلومات المنطقة بنجاح");
			return { previousAreas };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				seatingAreasQueries.list().queryKey,
				context?.previousAreas,
			);
			toast.error("حدث خطأ أثناء تعديل المنطقة");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: seatingAreasQueries.list().queryKey,
			});
		},
	});

	const onSubmit: SubmitHandler<AreaFormValues> = (data) => {
		if (isEditing) {
			updateSeatingAreaMutation.mutate({ ...data, id: editedAreaId });
		} else {
			createAreaMutation.mutate(data);
		}
	};

	const handleEdit = (area: Area) => {
		setIsEditing(true);
		setEditedAreaId(area.id);
		form.setValue("name_ar", area.name_ar);
		form.setValue("name_en", area.name_en);
		form.setValue("capacity", area.capacity);
		form.setValue("base_price", +area.base_price);
	};

	const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	return (
		<div className="space-y-6" dir="rtl">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Arabic Name */}
						<FormField
							control={form.control}
							name="name_ar"
							render={({ field }) => (
								<FormItem>
									<FormLabel>الاسم بالعربي</FormLabel>
									<FormControl>
										<Input placeholder="أدخل اسم المنطقة بالعربي" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						{/* English Name */}
						<FormField
							control={form.control}
							name="name_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>الاسم بالإنجليزي</FormLabel>
									<FormControl>
										<Input
											placeholder="أدخل اسم المنطقة بالإنجليزي"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Capacity */}
						<FormField
							control={form.control}
							name="capacity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>السعة</FormLabel>
									<FormControl>
										<NumberInputWithMinsPlusButtons
											min={1}
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{/* Base Price */}
						<FormField
							control={form.control}
							name="base_price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>السعر الأساسي</FormLabel>
									<FormControl>
										<NumberInputWithMinsPlusButtons
											min={0}
											value={field.value}
											onChange={field.onChange}
											suffix={<SaudiRiyalSymbol />}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Button type="submit" className="w-full">
							{isEditing ? "تحديث المنطقة" : "إضافة منطقة جديدة"}
						</Button>

						{isEditing && (
							<Button
								type="button"
								variant="secondary"
								className="w-full border"
								onClick={() => {
									setIsEditing(false);
									setEditedAreaId("");
									form.reset();
								}}
							>
								إلغاء التعديل
							</Button>
						)}
					</div>
				</form>
			</Form>

			<div className="mt-8">
				<h4 className="text-sm font-medium mb-4 text-center">
					قائمة المناطق المتوفرة في المقهى
				</h4>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-right">اسم المنطقة</TableHead>
							<TableHead className="text-right">
								اسم المنطقة (بالإنجليزية)
							</TableHead>
							<TableHead className="text-right">السعة</TableHead>
							<TableHead className="text-right">السعر</TableHead>
							<TableHead className="text-right">الإجراءات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Loading skeleton state */}
						{isLoading &&
							Array(3)
								.fill(0)
								.map((_, index) => (
									<TableRow
										key={`skeleton-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											index
										}`}
									>
										<TableCell>
											<Skeleton className="h-5 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-8" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-5 w-16" />
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Skeleton className="size-7" />
												<Skeleton className="size-7" />
											</div>
										</TableCell>
									</TableRow>
								))}
						{/* Empty state */}
						{!isLoading && !areas?.length && (
							<TableRow className="bg-muted/50">
								<TableCell colSpan={5} className="h-24 text-center">
									<div className="flex flex-col items-center justify-center">
										<p className="text-muted-foreground mb-2">
											لا توجد مناطق حاليًا
										</p>
										<p className="text-sm text-muted-foreground">
											قم بإضافة منطقة جديدة من خلال النموذج أعلاه
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}
						{/* Actual data */}
						{!isLoading &&
							areas &&
							areas.map((area) => (
								<TableRow key={area.id}>
									<TableCell>{area.name_ar}</TableCell>
									<TableCell>{area.name_en}</TableCell>
									<TableCell>{area.capacity}</TableCell>
									<TableCell>
										<div className="flex gap-1 items-center">
											<span>{area.base_price}</span>
											<SaudiRiyalSymbol />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="icon"
												className="size-7"
												onClick={() => handleEdit(area)}
											>
												<IconEdit className="size-4" />
											</Button>
											<Button
												variant="outline"
												size="icon"
												className="size-7"
												onClick={() => {
													setIsDeleteModalOpen(true);
													setAreaToDelete(area);
												}}
											>
												<IconTrash className="size-4 text-red-500" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>

			{areaToDelete && (
				<DeleteAreaDialog
					data={areaToDelete}
					isOpen={isDeleteModalOpen}
					onClose={() => {
						setIsDeleteModalOpen(false);
						setAreaToDelete(null);
					}}
				/>
			)}
		</div>
	);
};

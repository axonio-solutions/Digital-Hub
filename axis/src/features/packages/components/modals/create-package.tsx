import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Icons } from "@/components/icons";
import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { createPackageFn } from "@/fn/packages";
import { IconBox, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { packagesQueries } from "../../packages-queries";
import type {
	PackageFormValues,
	PackageItem,
	PackageWithItems,
} from "../../packages.types";
import { packageFormSchema } from "../../packages.validation";

interface CreatePackageDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function CreatePackageDialog({
	isOpen,
	onClose,
	onSuccess,
}: CreatePackageDialogProps) {
	const queryClient = useQueryClient();

	const form = useForm<PackageFormValues>({
		resolver: zodResolver(packageFormSchema),
		defaultValues: {
			name: "",
			items: [],
			isActive: false,
		},
	});

	const [newItem, setNewItem] = useState<PackageItem>({ name: "", price: 0 });
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const items = form.watch("items") || [];
	const { isDirty } = form.formState;

	const handleAddOrUpdateItem = () => {
		const currentItems = form.getValues("items") || [];

		if (editingIndex !== null) {
			const updatedItems = currentItems.map((item, index) =>
				index === editingIndex ? newItem : item,
			);
			form.setValue("items", updatedItems, { shouldDirty: true });
		} else {
			form.setValue("items", [...currentItems, newItem], {
				shouldDirty: true,
			});
		}

		setNewItem({ name: "", price: 0 });
		setEditingIndex(null);
	};

	const handleEditItem = (index: number) => {
		const currentItems = form.getValues("items") || [];
		setNewItem(currentItems[index]);
		setEditingIndex(index);
	};

	const handleDeleteItem = (index: number) => {
		const currentItems = form.getValues("items") || [];
		const updatedItems = currentItems.filter((_, i) => i !== index);
		form.setValue("items", updatedItems, { shouldDirty: true });
	};

	const createPackageMutation = useMutation({
		mutationFn: (updates: PackageFormValues) =>
			createPackageFn({ data: updates }),
		onMutate: async (newPackage) => {
			await queryClient.cancelQueries(packagesQueries.list());
			const previousPackages = queryClient.getQueryData<PackageWithItems[]>(
				packagesQueries.list().queryKey,
			);
			queryClient.setQueryData(packagesQueries.list().queryKey, (old = []) => {
				const optimisticPackage = {
					id: `temp-id-${Date.now()}`,
					name: newPackage.name,
					status: newPackage.isActive
						? "active"
						: ("inactive" as "active" | "inactive"),
					items: newPackage.items.map((item, index) => ({
						id: `temp-item-id-${Date.now()}-${index}`,
						name: item.name,
						price: String(item.price),
					})),
				};
				return [...old, optimisticPackage];
			});
			toast.success("تم إضافة الباكيج بنجاح");
			return { previousPackages };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				packagesQueries.list().queryKey,
				context?.previousPackages,
			);
			toast.error("Failed to create package");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: packagesQueries.list().queryKey,
			}),
	});

	const onSubmit: SubmitHandler<PackageFormValues> = async (data) => {
		createPackageMutation.mutate(data);
		onClose();
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(90vh,800px)] sm:max-w-xl [&>button:last-child]:top-3.5 rounded-xl">
				<DialogHeader className="contents space-y-0">
					<DialogTitle className="border-b px-6 py-4 text-base font-bold text-center">
						إنشاء باكيج جديد
					</DialogTitle>

					<ScrollArea className="max-h-[80vh] px-6" dir="rtl">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6 py-6"
							>
								{/* Package Name Field */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="-space-y-1">
											<FormLabel className="text-base">اسم الباكيج</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														placeholder="ادخل اسم الباكيج"
														className="text-base ps-8"
													/>
													<IconBox className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Package Items Section */}
								<div className="text-start">
									<h3 className="font-semibold text-base mb-1">
										عناصر الباكيج
									</h3>

									<div className="grid gap-4">
										{/* Add/Edit Item Form */}
										<div className="flex flex-col sm:flex-row gap-3">
											<div className="flex-1">
												<Input
													value={newItem.name}
													onChange={(e) =>
														setNewItem((prev) => ({
															...prev,
															name: e.target.value,
														}))
													}
													placeholder="اسم العنصر"
													className="text-base"
												/>
											</div>

											<div className="w-full sm:w-32">
												<NumberInputWithMinsPlusButtons
													min={0}
													value={newItem.price}
													onChange={(value) =>
														setNewItem((prev) => ({
															...prev,
															price: Number(value),
														}))
													}
												/>
											</div>

											<Button
												type="button"
												onClick={handleAddOrUpdateItem}
												disabled={!newItem.name.trim() || newItem.price <= 0}
												className="flex-1 sm:flex-initial"
												variant={
													editingIndex !== null ? "secondary" : "default"
												}
											>
												{editingIndex !== null ? (
													<>
														<IconEdit className="size-4" />
														تحديث
													</>
												) : (
													<>
														<IconPlus className="size-4" />
														إضافة
													</>
												)}
											</Button>
										</div>

										{/* Items List */}
										<div className="rounded-xl border">
											<ScrollArea dir="rtl" className="h-[240px]">
												{items.length > 0 ? (
													<div className="p-2">
														{items.map((item, index) => (
															<div
																// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
																key={index}
																className={`flex items-center justify-between p-3 rounded-md transition-colors border border-dashed border-gray-400 ${
																	editingIndex === index
																		? "bg-primary/5 border border-primary/20"
																		: "hover:bg-muted/50"
																} ${index !== items.length - 1 ? "mb-2" : ""}`}
															>
																<div className="flex items-center gap-3 min-w-0 flex-1">
																	<div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
																		{index + 1}
																	</div>
																	<div className="min-w-0 flex-1">
																		<div className="font-medium truncate">
																			{item.name}
																		</div>
																		<div className="text-sm text-blue-500 flex items-center gap-1">
																			<span>{item.price}</span>
																			<SaudiRiyalSymbol />
																		</div>
																	</div>
																</div>

																<div className="flex items-center gap-1 shrink-0">
																	<Button
																		variant="outline"
																		size="icon"
																		onClick={() => handleEditItem(index)}
																		className={`size-7 cursor-pointer ${
																			editingIndex === index
																				? "text-primary"
																				: ""
																		}`}
																	>
																		<IconEdit className="size-4" />
																	</Button>
																	<Button
																		variant="outline"
																		size="icon"
																		onClick={() => handleDeleteItem(index)}
																		className="size-7 cursor-pointer hover:text-destructive"
																	>
																		<IconTrash className="size-4" />
																	</Button>
																</div>
															</div>
														))}
													</div>
												) : (
													<div className="flex flex-col items-center justify-center h-full text-center p-4">
														<div className="size-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
															<IconPlus className="size-6 text-muted-foreground" />
														</div>
														<p className="text-muted-foreground text-sm">
															لا توجد عناصر، قم بإضافة عناصر للباكيج
														</p>
													</div>
												)}
											</ScrollArea>
										</div>
									</div>
								</div>

								{/* Status Switch */}
								<FormField
									control={form.control}
									name="isActive"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 text-start">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													حالة الباكيج
												</FormLabel>
												<FormDescription className="text-base">
													{field.value ? "نشط" : "غير نشط"}
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													dir="ltr"
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Submit Button */}
								<DialogFooter>
									<Button
										className="w-full sm:w-40 cursor-pointer"
										type="submit"
										disabled={
											createPackageMutation.status === "pending" || !isDirty
										}
									>
										{createPackageMutation.status === "pending" ? (
											<Icons.spinner />
										) : (
											"إضافة باكيج جديد"
										)}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</ScrollArea>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

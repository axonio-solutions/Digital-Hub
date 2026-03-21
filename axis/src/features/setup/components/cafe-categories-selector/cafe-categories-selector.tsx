import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useId } from "react";
import type { CafeCategory } from "./cafe-categories.types";

interface CafeCategoriesSelectorProps {
	value?: string[];
	onChange: (value: string[]) => void;
	data?: CafeCategory[];
	isLoading: boolean;
}

export function CafeCategoriesSelector({
		value = [],
		onChange,
		data,
		isLoading,
	}: CafeCategoriesSelectorProps) {
		const isRTL = true;
		const id = useId();

		const handleCheckedChange = (categoryId: string, checked: boolean) => {
			if (checked) {
				if (value.length < 3) {
					onChange([...value, categoryId]);
				}
				return;
			}
			onChange(value.filter((v) => v !== categoryId));
		};

		const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

		return (
			<div className="grid gap-2" dir={isRTL ? "rtl" : "ltr"}>
				{isLoading || !data
					? skeletonItems.map((i) => (
							<div
								key={`category-skeleton-${i}`}
								className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5"
							>
								<Skeleton
									className={`${isRTL ? "order-last" : "order-1"} h-4 w-4 border rounded-sm`}
								/>
								<div
									className={`grid grow gap-2 ${isRTL ? "text-right" : "text-left"}`}
								>
									<Skeleton className="h-4 w-24 border rounded-sm" />
									<Skeleton className="h-3 w-full max-w-60 border rounded-sm" />
								</div>
							</div>
						))
					: data.map((category) => (
							<div
								key={category.id}
								className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
							>
								<Checkbox
									id={`${id}-${category.id}`}
									checked={value.includes(category.id)}
									onCheckedChange={(checked) =>
										handleCheckedChange(category.id, checked as boolean)
									}
									className={`${
										isRTL ? "order-last" : "order-1"
									} after:absolute after:inset-0`}
									disabled={!value.includes(category.id) && value.length >= 3}
								/>
								<div
									className={`grid grow gap-2 ${isRTL ? "text-right" : "text-left"}`}
								>
									<Label
										htmlFor={`${id}-${category.id}`}
										className="font-medium"
									>
										{isRTL ? category.title_ar : category.title_en}
									</Label>
									{(category.description_ar || category.description_en) && (
										<p className="text-xs text-muted-foreground">
											{isRTL
												? category.description_ar
												: category.description_en}
										</p>
									)}
									{value.length >= 3 && !value.includes(category.id) && (
										<p
											className={`text-xs text-red-500 ${
												isRTL ? "text-right" : "text-left"
											}`}
										>
											يمكنك اختيار 3 تصنيفات كحد أقصى
										</p>
									)}
								</div>
							</div>
						))}
			</div>
		);
	}

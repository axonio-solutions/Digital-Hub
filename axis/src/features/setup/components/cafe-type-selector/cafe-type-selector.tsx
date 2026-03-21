import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useId } from "react";
import type { CafeType } from "./cafe-types.types";

interface CafeTypeSelectorProps {
	value?: string;
	onChange: (value: string) => void;
	data?: CafeType[];
	isLoading: boolean;
}

export function CafeTypeSelector({
	value,
	onChange,
	data,
	isLoading,
}: CafeTypeSelectorProps) {
	const id = useId();
	const isRTL = true;

	const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

	return (
		<RadioGroup
			className="grid gap-2"
			value={value}
			onValueChange={onChange}
			dir={isRTL ? "rtl" : "ltr"}
		>
			{isLoading || !data
				? skeletonItems.map((i) => (
						<div
							key={`type-skeleton-${i}`}
							className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5"
						>
							<Skeleton
								className={`${isRTL ? "order-last" : "order-1"} h-4 w-4 border`}
							/>
							<div
								className={`grid grow gap-2 ${isRTL ? "text-right" : "text-left"}`}
							>
								<Skeleton className="h-4 w-24 border rounded-sm" />
								<Skeleton className="h-3 w-full max-w-60 border rounded-sm" />
							</div>
						</div>
					))
				: data.map((type) => (
						<div
							key={type.id}
							className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
						>
							<RadioGroupItem
								value={type.id}
								id={`${id}-${type.id}`}
								className={`${
									isRTL ? "order-last" : "order-1"
								} after:absolute after:inset-0`}
							/>
							<div
								className={`grid grow gap-2 ${isRTL ? "text-right" : "text-left"}`}
							>
								<Label htmlFor={`${id}-${type.id}`} className="font-medium">
									{isRTL ? type.title_ar : type.title_en}
								</Label>
								{(type.description_ar || type.description_en) && (
									<p className="text-xs text-muted-foreground">
										{isRTL ? type.description_ar : type.description_en}
									</p>
								)}
							</div>
						</div>
					))}
		</RadioGroup>
	);
}

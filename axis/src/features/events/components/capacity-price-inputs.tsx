import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import type { CreateMatchFormData } from "../schema";
import NumberInputWithMinsPlusButtons from "@/components/inputs/number-input-with-mins-plus-buttons";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { seatingAreasQueries } from "@/features/spaces/components/seating-areas/seating-areas.queries";

interface CapacityPriceInputsProps {
	form: UseFormReturn<CreateMatchFormData>;
}

export function CapacityPriceInputs({ form }: CapacityPriceInputsProps) {
	const selectedAreaIds = form.watch("areas");
	const { data: areas } = useQuery({
		...seatingAreasQueries.list(),
		enabled: form.watch("match") !== "",
	});

	const computedCapacity = selectedAreaIds.reduce((acc, areaItem) => {
		const area = areas?.find((area) => area.id === areaItem.id);
		return acc + (area?.capacity || 0);
	}, 0);

	return (
		<>
			<FormField
				control={form.control}
				name="capacity"
				render={({ field }) => (
					<FormItem>
						<FormLabel>السعة</FormLabel>
						<NumberInputWithMinsPlusButtons
							min={0}
							value={field.value}
							onChange={field.onChange}
						/>
						<p className="text-xs text-muted-foreground">
							{`السعة المحسوبة من المناطق المختارة: ${computedCapacity}`}
						</p>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}

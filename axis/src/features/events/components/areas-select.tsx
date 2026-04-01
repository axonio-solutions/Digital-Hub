import { IconAlertCircle, IconLoader } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import type { AreaItem, CreateMatchFormData } from "../schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { seatingAreasQueries } from "@/features/spaces/components/seating-areas/seating-areas.queries";

interface AreasSelectProps {
	form: UseFormReturn<CreateMatchFormData>;
}

export function AreasSelect({ form }: AreasSelectProps) {
	const {
		data: areas,
		isLoading,
		error,
	} = useQuery({
		...seatingAreasQueries.list(),
		enabled: form.watch("match") !== "",
	});

	return (
		<FormField
			control={form.control}
			name="areas"
			render={({ field }) => (
				<div className="space-y-2">
					<Label className="text-right">منطقة المشاهدة</Label>
					<div className="space-y-2 bg-background p-2 text-sm text-start rounded-lg border border-input">
						{isLoading && (
							<div className="flex items-center justify-center">
								<IconLoader className="h-5 w-5 animate-spin" />
							</div>
						)}
						{error && (
							<Alert variant="destructive" className="border-0 p-0">
								<IconAlertCircle className="h-4 w-4" />
								<AlertDescription>حدث خطأ أثناء تحميل المناطق</AlertDescription>
							</Alert>
						)}
						{areas && areas.length === 0 ? (
							<Alert className="border-0 py-0 px-1">
								<AlertDescription>لا توجد مناطق متاحة</AlertDescription>
							</Alert>
						) : (
							areas?.map((area) => (
								// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
								<div
									key={area.id}
									className={`flex relative cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent border hover:text-accent-foreground ${
										field.value.some((a) => a.id === area.id)
											? "bg-blue-50 text-blue-800 border-blue-200"
											: ""
									}`}
									onClick={() => {
										const isSelected = field.value.some(
											(a) => a.id === area.id,
										);

										let newSelection: Array<AreaItem>;
										if (isSelected) {
											newSelection = field.value.filter(
												(a) => a.id !== area.id,
											);
										} else {
											newSelection = [
												...field.value,
												{ id: area.id, price: area.base_price },
											];
										}

										const previousSelection = form.getValues("areas");
										field.onChange(newSelection);

										const addedAreas = newSelection.filter(
											(a) => !previousSelection.some((p) => p.id === a.id),
										);
										const removedAreas = previousSelection.filter(
											(a) => !newSelection.some((n) => n.id === a.id),
										);

										const additions = addedAreas.reduce((acc, item) => {
											const area = areas.find((a) => a.id === item.id);
											return acc + (area?.capacity || 0);
										}, 0);

										const reductions = removedAreas.reduce((acc, item) => {
											const area = areas.find((a) => a.id === item.id);
											return acc + (area?.capacity || 0);
										}, 0);

										const currentCapacity = form.getValues("capacity");
										const newCapacity =
											currentCapacity + additions - reductions;
										form.setValue("capacity", newCapacity, {
											shouldValidate: true,
										});
									}}
								>
									{area.name_ar} ({area.capacity} مقعد)
									<span className="text-muted-foreground ms-1">
										- {area.base_price} ريال
									</span>
								</div>
							))
						)}
					</div>
					<FormMessage />
				</div>
			)}
		/>
	);
}

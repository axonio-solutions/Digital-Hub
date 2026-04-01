import { IconAlertCircle, IconLoader } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import type { CreateMatchFormData, PackageItem } from "../schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { packagesQueries } from "@/features/packages/packages-queries";

interface PackagesSelectProps {
	form: UseFormReturn<CreateMatchFormData>;
}

export function PackagesSelect({ form }: PackagesSelectProps) {
	const {
		data: packages,
		isLoading,
		error,
	} = useQuery({
		...packagesQueries.list(),
		enabled: form.watch("match") !== "",
	});

	return (
		<FormField
			control={form.control}
			name="packages"
			render={({ field }) => (
				<div className="space-y-2">
					<Label>الباكيجات</Label>
					<div className="space-y-2 bg-background p-2 text-sm text-start rounded-lg border border-input">
						{isLoading && (
							<div className="flex items-center justify-center">
								<IconLoader className="h-5 w-5 animate-spin" />
							</div>
						)}
						{error && (
							<Alert variant="destructive" className="border-0 p-0">
								<IconAlertCircle className="h-4 w-4" />
								<AlertDescription>
									حدث خطأ أثناء تحميل الباكيجات
								</AlertDescription>
							</Alert>
						)}
						{packages && packages.length === 0 ? (
							<Alert className="border-0 py-0 px-1">
								<AlertDescription>لا توجد باكيجات متاحة</AlertDescription>
							</Alert>
						) : (
							packages?.map((pkg) => (
								// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
								<div
									key={pkg.id}
									className={`flex relative cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent border hover:text-accent-foreground ${
										field.value.some((p) => p.id === pkg.id)
											? "bg-blue-50 text-blue-800 border-blue-200"
											: ""
									}`}
									onClick={() => {
										const isSelected = field.value.some((p) => p.id === pkg.id);

										let newSelection: Array<PackageItem>;
										if (isSelected) {
											newSelection = field.value.filter((p) => p.id !== pkg.id);
										} else {
											newSelection = [
												...field.value,
												{
													id: pkg.id,
													price: pkg.items
														.reduce((sum, item) => sum + Number(item.price), 0)
														.toString(),
												},
											];
										}

										field.onChange(newSelection);
									}}
								>
									<span>{pkg.name}</span>
									<span className="text-muted-foreground ms-1">
										-{" "}
										{pkg.items.reduce(
											(sum, item) => sum + Number(item.price),
											0,
										)}{" "}
										ريال
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

import { IconCircleDashed, IconCircleDashedCheck } from "@tabler/icons-react";
import type * as React from "react";

import type { PackageWithItems } from "../../packages.types";
import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PackageDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	packageData: PackageWithItems | null;
}

type PackageItemProps = {
	label: string;
	value: React.ReactNode;
};

const PackageItem: React.FC<PackageItemProps> = ({ label, value }) => (
	<div className="flex justify-between items-center py-3 border-b">
		<div className="font-medium">{label}</div>
		<div>{value}</div>
	</div>
);

export function PackageDetailsModal({
	isOpen,
	onClose,
	packageData,
}: PackageDetailsModalProps) {
	if (!packageData) return null;

	// Calculate total price
	const totalPrice = packageData.items.reduce(
		(sum, item) => sum + Number(item.price),
		0,
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-md [&>button:last-child]:top-3.5 rounded-xl">
				<DialogHeader className="contents space-y-0">
					<DialogTitle className="border-b px-6 py-4 text-base font-bold text-center">
						تفاصيل الباكيج
						<span className="font-bold text-blue-400 block">
							"{packageData.name}"
						</span>
					</DialogTitle>

					<div className="overflow-y-auto">
						<div className="px-6 py-4 space-y-4">
							<div className="space-y-3">
								<PackageItem label="اسم الباكيج" value={packageData.name} />

								<PackageItem
									label="عدد العناصر"
									value={<span>{packageData.items.length}</span>}
								/>

								<PackageItem
									label="سعر الباكيج الإجمالي"
									value={
										<div className="flex items-center gap-1">
											<span>{totalPrice}</span>
											<SaudiRiyalSymbol />
										</div>
									}
								/>

								<PackageItem
									label="الحالة"
									value={
										<Badge
											variant="outline"
											className={cn(
												"px-2.5 py-0.5",
												packageData.status === "active"
													? "bg-green-50 text-green-700 border-green-200"
													: "text-muted-foreground",
											)}
										>
											{packageData.status === "active" ? (
												<IconCircleDashedCheck className="h-4 w-4" />
											) : (
												<IconCircleDashed className="h-4 w-4" />
											)}
											{packageData.status === "active" ? "نشط" : "غير نشط"}
										</Badge>
									}
								/>
							</div>

							<div className="pt-2 text-start">
								<h3 className="font-bold text-base mb-3">عناصر الباقة</h3>

								{packageData.items.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border not-last-of-type:mb-3"
									>
										<span>{item.name}</span>
										<div className="flex items-center gap-1">
											<span>{item.price}</span>
											<SaudiRiyalSymbol />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

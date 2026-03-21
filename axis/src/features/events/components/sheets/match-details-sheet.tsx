import type * as React from "react";

import { SaudiRiyalSymbol } from "@/components/saudi_riyal_symbol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
	IconCalendar,
	IconCircleDashed,
	IconCircleDashedCheck,
	IconClock,
	IconInfoCircle,
	IconMapPin,
	IconUsers,
} from "@tabler/icons-react";
import type { EditMatchEntry } from "../../schema";

interface MatchDetailsSheetProps {
	isOpen: boolean;
	onClose: () => void;
	match: EditMatchEntry | null;
}

type MatchItemProps = {
	label: string;
	value: React.ReactNode;
};

const MatchItem: React.FC<MatchItemProps> = ({ label, value }) => (
	<div className="flex justify-between items-center py-3 border-b">
		<div className="font-medium">{label}</div>
		<div>{value}</div>
	</div>
);

export function MatchDetailsSheet({
	isOpen,
	onClose,
	match,
}: MatchDetailsSheetProps) {
	if (!match) return null;

	const statusBadge = (
		<Badge
			variant="outline"
			className={cn(
				"px-2.5 py-0.5",
				match.status === "upcoming"
					? "bg-blue-50 text-blue-700 border-blue-200"
					: match.status === "ongoing"
					? "bg-green-50 text-green-700 border-green-200"
					: match.status === "completed"
					? "bg-gray-50 text-gray-700 border-gray-200"
					: "bg-red-50 text-red-700 border-red-200",
			)}
		>
			{match.status === "upcoming" ? (
				<IconCircleDashed className="h-4 w-4" />
			) : match.status === "ongoing" ? (
				<IconCircleDashedCheck className="h-4 w-4" />
			) : match.status === "completed" ? (
				<IconCircleDashedCheck className="h-4 w-4" />
			) : (
				<IconCircleDashed className="h-4 w-4" />
			)}
			{match.status === "upcoming"
				? "مُجدولة"
				: match.status === "ongoing"
				? "تجري الآن"
				: match.status === "completed"
				? "مكتملة"
				: "ملغية"}
		</Badge>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-md [&>button:last-child]:top-3.5 rounded-xl">
				<DialogHeader className="contents space-y-0">
					<DialogTitle className="border-b px-6 py-4 text-base font-bold text-center">
						تفاصيل المباراة
						<span className="font-bold text-blue-400 block">
							"{match.match}"
						</span>
					</DialogTitle>

					<div className="overflow-y-auto">
						<div className="space-y-3 p-6">
							<MatchItem label="اسم المباراة" value={match.match} />

							<MatchItem
								label="التاريخ"
								value={
									<div className="flex items-center gap-1">
										<IconCalendar className="size-4 text-muted-foreground" />
										<span>{match.date}</span>
									</div>
								}
							/>

							<MatchItem
								label="الوقت"
								value={
									<div className="flex items-center gap-1">
										<IconClock className="size-4 text-muted-foreground" />
										<span>{match.time}</span>
									</div>
								}
							/>

							<MatchItem
								label="السعة الكلية"
								value={
									<div className="flex items-center gap-1">
										<IconUsers className="size-4 text-muted-foreground" />
										<span>{match.capacity.total}</span>
									</div>
								}
							/>

							<MatchItem
								label="المقاعد المتبقية"
								value={
									<div className="flex items-center gap-1">
										<IconUsers className="size-4 text-muted-foreground" />
										<span>{match.capacity.remaining}</span>
									</div>
								}
							/>

							<MatchItem label="الحالة" value={statusBadge} />
						</div>
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
	const hours = Math.floor(i / 2);
	const minutes = (i % 2) * 30;
	return {
		value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
		label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
	};
});

interface TimeInputProps {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	label?: string;
	dir?: "ltr" | "rtl";
}

const TimeInput = React.memo(
	({ value, onChange, disabled, label, dir = "rtl" }: TimeInputProps) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const parentRef = React.useRef<HTMLDivElement>(null);

		const rowVirtualizer = useVirtualizer({
			count: TIME_OPTIONS.length,
			getScrollElement: () => parentRef.current,
			estimateSize: () => 35,
			overscan: 5,
			enabled: isOpen,
		});

		React.useEffect(() => {
			if (isOpen && parentRef.current) {
				rowVirtualizer.measure();
			}
		}, [isOpen, rowVirtualizer]);

		const handleValueChange = (newValue: string) => {
			if (onChange) {
				onChange(newValue);
			}
			setIsOpen(false);
		};

		return (
			<div className="space-y-1" dir={dir}>
				{label && <p className="text-sm">{label}</p>}
				<Select
					value={value}
					onValueChange={handleValueChange}
					disabled={disabled}
					open={isOpen}
					onOpenChange={setIsOpen}
					dir={dir}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="اختر الوقت">{value}</SelectValue>
					</SelectTrigger>
					<SelectContent className="[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
						<SelectGroup className="max-h-[280px]">
							<div ref={parentRef} className="h-[280px] overflow-auto">
								<div
									className="relative w-full"
									style={{
										height: `${rowVirtualizer.getTotalSize()}px`,
									}}
								>
									{rowVirtualizer.getVirtualItems().map((virtualRow) => {
										const option = TIME_OPTIONS[virtualRow.index];
										return (
											<div
												key={option.value}
												className="absolute w-full"
												style={{
													height: `${virtualRow.size}px`,
													transform: `translateY(${virtualRow.start}px)`,
												}}
											>
												<SelectItem
													value={option.value}
													className={value === option.value ? "bg-accent" : ""}
												>
													{option.label}
												</SelectItem>
											</div>
										);
									})}
								</div>
							</div>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		);
	},
);

TimeInput.displayName = "TimeInput";

export default TimeInput;

import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Option = {
	value: string;
	label: string;
};

interface VirtualizedCommandProps {
	height: string;
	options: Array<Option>;
	placeholder: string;
	selectedOption: string;
	onSelectOption?: (option: string) => void;
	disabled?: boolean;
}

const VirtualizedCommand = ({
	height,
	options,
	placeholder,
	selectedOption,
	onSelectOption,
	disabled = false,
}: VirtualizedCommandProps) => {
	const [filteredOptions, setFilteredOptions] =
		React.useState<Array<Option>>(options);
	const [focusedIndex, setFocusedIndex] = React.useState(0);
	const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false);

	const parentRef = React.useRef(null);

	const virtualizer = useVirtualizer({
		count: filteredOptions.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 35,
	});

	const virtualOptions = virtualizer.getVirtualItems();

	const scrollToIndex = (index: number) => {
		virtualizer.scrollToIndex(index, {
			align: "center",
		});
	};

	const handleSearch = (search: string) => {
		setIsKeyboardNavActive(false);
		setFilteredOptions(
			options.filter((option) =>
				option.value.toLowerCase().includes(search.toLowerCase() ?? []),
			),
		);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (disabled) return;

		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();
				setIsKeyboardNavActive(true);
				setFocusedIndex((prev) => {
					const newIndex =
						prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
					scrollToIndex(newIndex);
					return newIndex;
				});
				break;
			}
			case "ArrowUp": {
				event.preventDefault();
				setIsKeyboardNavActive(true);
				setFocusedIndex((prev) => {
					const newIndex =
						prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
					scrollToIndex(newIndex);
					return newIndex;
				});
				break;
			}
			case "Enter": {
				event.preventDefault();
				if (filteredOptions[focusedIndex]) {
					onSelectOption?.(filteredOptions[focusedIndex].value);
				}
				break;
			}
			default:
				break;
		}
	};

	React.useEffect(() => {
		if (selectedOption) {
			const index = filteredOptions.findIndex(
				(option) => option.value === selectedOption,
			);
			if (index >= 0) {
				setFocusedIndex(index);
				virtualizer.scrollToIndex(index, { align: "center" });
			}
		}
	}, [selectedOption, filteredOptions, virtualizer]);

	React.useEffect(() => {
		setFilteredOptions(options);
	}, [options]);

	return (
		<Command shouldFilter={false} onKeyDown={handleKeyDown}>
			<CommandInput
				onValueChange={handleSearch}
				placeholder={placeholder}
				disabled={disabled}
			/>
			<CommandList
				ref={parentRef}
				style={{
					height: height,
					width: "100%",
					overflow: "auto",
				}}
				onMouseDown={() => setIsKeyboardNavActive(false)}
				onMouseMove={() => setIsKeyboardNavActive(false)}
			>
				<CommandEmpty>No item found.</CommandEmpty>
				<CommandGroup>
					<div
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{virtualOptions.map((virtualOption) => (
							<CommandItem
								key={filteredOptions[virtualOption.index].value}
								disabled={isKeyboardNavActive || disabled}
								className={cn(
									"absolute left-0 top-0 w-full bg-transparent",
									focusedIndex === virtualOption.index &&
										"bg-accent text-accent-foreground",
									isKeyboardNavActive &&
										focusedIndex !== virtualOption.index &&
										"aria-selected:bg-transparent aria-selected:text-primary",
									disabled && "cursor-not-allowed opacity-50",
								)}
								style={{
									height: `${virtualOption.size}px`,
									transform: `translateY(${virtualOption.start}px)`,
								}}
								value={filteredOptions[virtualOption.index].value}
								onMouseEnter={() =>
									!isKeyboardNavActive && setFocusedIndex(virtualOption.index)
								}
								onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
								onSelect={disabled ? undefined : onSelectOption}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										selectedOption ===
											filteredOptions[virtualOption.index].value
											? "opacity-100"
											: "opacity-0",
									)}
								/>
								{filteredOptions[virtualOption.index].label}
							</CommandItem>
						))}
					</div>
				</CommandGroup>
			</CommandList>
		</Command>
	);
};

interface VirtualizedComboboxProps {
	options: Array<string>;
	searchPlaceholder?: string;
	width?: string;
	height?: string;
	onSelect?: (option: string) => void;
	selectedOption?: string;
	disabled?: boolean;
}

export function VirtualizedCombobox({
	options,
	searchPlaceholder = "Search items...",
	height = "400px",
	onSelect,
	selectedOption = "",
	disabled = false,
}: VirtualizedComboboxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={disabled ? false : open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					// biome-ignore lint/a11y/useSemanticElements: <explanation>
					role="combobox"
					aria-expanded={open}
					className={cn(
						"justify-between",
						disabled && "opacity-50 cursor-not-allowed",
					)}
					disabled={disabled}
				>
					{selectedOption || searchPlaceholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<VirtualizedCommand
					height={height}
					options={options.map((option) => ({ value: option, label: option }))}
					placeholder={searchPlaceholder}
					selectedOption={selectedOption}
					onSelectOption={(currentValue) => {
						onSelect?.(currentValue);
						setOpen(false);
					}}
					disabled={disabled}
				/>
			</PopoverContent>
		</Popover>
	);
}

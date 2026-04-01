import { IconMinus, IconPlus } from "@tabler/icons-react";
import {  forwardRef } from "react";
import {
	Button,
	Group,
	Input,
	Label,
	NumberField,
} from "react-aria-components";
import type {ReactNode} from "react";

interface NumberInputWithMinsPlusButtonsProps {
	value?: number;
	onChange?: (value: number) => void;
	onBlur?: () => void;
	name?: string;
	defaultValue?: number;
	formatOptions?: Intl.NumberFormatOptions;
	min?: number;
	max?: number;
	label?: string;
	suffix?: string | ReactNode;
	"aria-label"?: string;
}

const NumberInputWithMinsPlusButtons = forwardRef<
	HTMLInputElement,
	NumberInputWithMinsPlusButtonsProps
>(
	(
		{
			value,
			onChange,
			onBlur,
			name,
			defaultValue = 0,
			formatOptions,
			min,
			max,
			label,
			suffix,
			"aria-label": ariaLabel,
		},
		ref,
	) => {
		return (
			<NumberField
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				name={name}
				defaultValue={defaultValue}
				formatOptions={formatOptions}
				minValue={min}
				maxValue={max}
				aria-label={ariaLabel || "Amount"}
			>
				{label && <Label className="sr-only">{label}</Label>}
				<Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 ring-offset-background transition-shadow data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-1 data-[focus-within]:ring-ring/30 data-[focus-within]:ring-offset-2">
					<Button
						slot="decrement"
						className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 ring-offset-background transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<IconMinus size={16} strokeWidth={2} aria-hidden="true" />
					</Button>
					<div className="relative flex w-full items-center">
						<Input
							ref={ref}
							className="w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none"
						/>
						{suffix && (
							<span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-sm text-muted-foreground">
								{suffix}
							</span>
						)}
					</div>
					<Button
						slot="increment"
						className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 ring-offset-background transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<IconPlus size={16} strokeWidth={2} aria-hidden="true" />
					</Button>
				</Group>
			</NumberField>
		);
	},
);

NumberInputWithMinsPlusButtons.displayName = "NumberInputWithMinsPlusButtons";

export default NumberInputWithMinsPlusButtons;

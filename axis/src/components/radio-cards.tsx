import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RadioCardsOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface RadioCardsProps extends React.HTMLAttributes<HTMLDivElement> {
	options: Array<RadioCardsOption>;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	columns?: number;
}

const RadioCards = React.forwardRef<HTMLDivElement, RadioCardsProps>(
	(
		{
			options,
			value,
			defaultValue,
			onValueChange,
			columns = 2,
			className,
			...props
		},
		ref,
	) => {
		const id = React.useId();

		return (
			<div ref={ref} {...props}>
				<RadioGroup
					value={value}
					defaultValue={defaultValue}
					onValueChange={onValueChange}
					className={cn(`grid grid-cols-${columns} gap-2`, className)}
				>
					{options.map((option) => (
						// biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
						<label
							key={`${id}-${option.value}`}
							className="relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-input px-2 py-3 text-center shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-disabled]]:cursor-not-allowed has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-[[data-disabled]]:opacity-50  has-[:focus-visible]:outline has-[:focus-visible]:outline-ring/70"
						>
							<RadioGroupItem
								id={`${id}-${option.value}`}
								value={option.value}
								className="sr-only after:absolute after:inset-0"
								disabled={option.disabled}
							/>
							<p className="text-sm font-medium leading-none text-foreground">
								{option.label}
							</p>
						</label>
					))}
				</RadioGroup>
			</div>
		);
	},
);

RadioCards.displayName = "RadioCards";

export { RadioCards, type RadioCardsOption };

import { Check, Eye, EyeOff, X } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
	regex: RegExp;
	text: string;
}

interface PasswordInputWithStrengthProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	showStrengthIndicator?: boolean;
	requirements?: Array<PasswordRequirement>;
}

const defaultRequirements: Array<PasswordRequirement> = [
	{ regex: /.{8,}/, text: "At least 8 characters" },
	{ regex: /[0-9]/, text: "At least 1 number" },
	{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
	{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
];

const PasswordInputWithStrength = React.forwardRef<
	HTMLInputElement,
	PasswordInputWithStrengthProps
>(
	(
		{
			className,
			showStrengthIndicator = true,
			requirements = defaultRequirements,
			onChange,
			...props
		},
		ref,
	) => {
		const [isVisible, setIsVisible] = React.useState(false);
		const [strength, setStrength] = React.useState<
			Array<{ met: boolean; text: string }>
		>([]);
		const id = React.useId();

		const strengthScore = React.useMemo(() => {
			return strength.filter((req) => req.met).length;
		}, [strength]);

		const getStrengthColor = (score: number, maxScore: number) => {
			if (score === 0) return "bg-border";
			if (score < maxScore / 2) return "bg-red-500";
			if (score < maxScore) return "bg-amber-500";
			return "bg-emerald-500";
		};

		const getStrengthText = (score: number, maxScore: number) => {
			if (score === 0) return "أدخل كلمة مرور";
			if (score < maxScore / 2) return "كلمة مرور ضعيفة";
			if (score < maxScore) return "كلمة مرور متوسطة";
			return "كلمة مرور قوية";
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newStrength = requirements.map((req) => ({
				met: req.regex.test(e.target.value),
				text: req.text,
			}));
			setStrength(newStrength);
			onChange?.(e);
		};

		const toggleVisibility = () => setIsVisible((prev) => !prev);

		return (
			<div className="space-y-1">
				<div className="relative">
					<Input
						ref={ref}
						type={isVisible ? "text" : "password"}
						className={cn("ps-9", className)}
						onChange={handleChange}
						aria-invalid={strengthScore < requirements.length}
						aria-describedby={`${id}-description`}
						{...props}
					/>
					<button
						type="button"
						onClick={toggleVisibility}
						className="absolute inset-y-0 start-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-50"
						aria-label={isVisible ? "Hide password" : "Show password"}
						aria-pressed={isVisible}
					>
						{isVisible ? (
							<EyeOff className="h-4 w-4" aria-hidden="true" />
						) : (
							<Eye className="h-4 w-4" aria-hidden="true" />
						)}
					</button>
				</div>

				{showStrengthIndicator && strength.length > 0 && (
					<>
						{/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
						<div
							className="h-1 w-full overflow-hidden rounded-full bg-border"
							role="progressbar"
							aria-valuenow={strengthScore}
							aria-valuemin={0}
							aria-valuemax={requirements.length}
							aria-label="Password strength"
						>
							<div
								className={`h-full ${getStrengthColor(
									strengthScore,
									requirements.length,
								)} transition-all duration-500 ease-out`}
								style={{
									width: `${(strengthScore / requirements.length) * 100}%`,
								}}
							/>
						</div>

						<p
							id={`${id}-description`}
							className="text-sm font-medium text-foreground"
						>
							{getStrengthText(strengthScore, requirements.length)}
						</p>

						<ul className="space-y-1.5" aria-label="Password requirements">
							{strength.map((req, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<li key={index} className="flex items-center gap-2">
									{req.met ? (
										<Check
											className="h-4 w-4 text-emerald-500"
											aria-hidden="true"
										/>
									) : (
										<X
											className="h-4 w-4 text-muted-foreground/80"
											aria-hidden="true"
										/>
									)}
									<span
										className={`text-xs ${
											req.met ? "text-emerald-600" : "text-muted-foreground"
										}`}
									>
										{req.text}
										<span className="sr-only">
											{req.met
												? " - Requirement met"
												: " - Requirement not met"}
										</span>
									</span>
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		);
	},
);

PasswordInputWithStrength.displayName = "PasswordInputWithStrength";

export { PasswordInputWithStrength, type PasswordRequirement };

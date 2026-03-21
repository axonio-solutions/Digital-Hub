import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LEAGUES } from "@/features/events/constants";
import type { UseFormReturn } from "react-hook-form";
import type { CreateMatchFormData } from "../schema";

interface LeagueSelectProps {
	form: UseFormReturn<CreateMatchFormData>;
	isLoading?: boolean;
}

export function LeagueSelect({ form, isLoading }: LeagueSelectProps) {
	return (
		<FormField
			control={form.control}
			name="league"
			render={({ field }) => (
				<FormItem>
					<FormLabel>إختر الدوري</FormLabel>
					<Select
						onValueChange={field.onChange}
						value={field.value}
						dir="rtl"
						disabled={isLoading}
					>
						<FormControl>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={isLoading ? "جاري جلب البيانات" : "اختر الدوري"}
								/>
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{SUPPORTED_LEAGUES.map((countryLeagues) => (
								<div key={countryLeagues.country}>
									<span className="text-xs font-medium text-muted-foreground px-2">
										{countryLeagues.country}
									</span>
									{countryLeagues.leagues.map((league) => (
										<SelectItem key={league.id} value={league.id.toString()}>
											{league.name}
										</SelectItem>
									))}
								</div>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

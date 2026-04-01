import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function TermsInput() {
	const { control } = useFormContext();
	return (
		<FormField
			control={control}
			name="terms"
			render={({ field }) => (
				<FormItem>
					<FormLabel>الاحكام والشروط</FormLabel>
					<FormControl>
						<Textarea
							className="min-h-28"
							placeholder="قم بادخال الاحكام والشروط"
							value={field.value || ""}
							onChange={field.onChange}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

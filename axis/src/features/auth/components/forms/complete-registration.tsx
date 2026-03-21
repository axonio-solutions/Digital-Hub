import { Icons } from "@/components/icons";
import { PhoneInput } from "@/components/inputs/phone-input";
import { RadioCards } from "@/components/radio-cards";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useCompleteRegistration } from "../../hooks/use-complete-registration";

export default function CompleteRegistrationForm() {
	const { form, isPending, onSubmit } = useCompleteRegistration();

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>أنا...</FormLabel>
							<FormControl>
								<RadioCards
									options={[
										{ value: "customer", label: "زبون" },
										{ value: "cafe_owner", label: "صاحب مقهى" },
									]}
									value={field.value}
									defaultValue="customer"
									onValueChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>رقم الهاتف</FormLabel>
							<FormControl>
								<PhoneInput
									defaultCountry="SA"
									placeholder="XXXXXXXXX"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button disabled={isPending} type="submit" className="w-full">
					{isPending ? <Icons.spinner /> : "إكمال التسجيل"}
				</Button>
			</form>
		</Form>
	);
}

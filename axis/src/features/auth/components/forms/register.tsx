import { Link } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";
import { UI_CONFIG } from "../../constants/config";
import { useRegistration } from "../../hooks/use-registration";
import OAuthButtons from "../oauth-buttons";
import type { RegistrationFormData } from "../../validation";
import { Icons } from "@/components/icons";
import { PasswordInputWithStrength } from "@/components/inputs/password-input-with-strength";
import { PhoneInput } from "@/components/inputs/phone-input";
import { RadioCards } from "@/components/radio-cards";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
	const { isPending, onSubmit } = useRegistration();
	const form = useFormContext<RegistrationFormData>();

	return (
		<div className="flex flex-col gap-4">
			<OAuthButtons mode="signup" />

			<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
				<span className="relative z-10 bg-background px-2 text-muted-foreground">
					أو تابع باستخدام
				</span>
			</div>

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
								<FormLabel>أنا ...</FormLabel>
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
						name="fullName"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>الاسم الكامل</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="أدخل اسمك الكامل"
										maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>البريد الإلكتروني</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="email"
										placeholder="أدخل بريدك الإلكتروني"
										maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
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

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>كلمة المرور</FormLabel>
								<FormControl>
									<PasswordInputWithStrength
										placeholder="أنشئ كلمة مرور"
										requirements={[
											{ regex: /.{6,}/, text: "6 أحرف على الأقل" },
											{ regex: /\d/, text: "رقم واحد على الأقل" },
										]}
										maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel>تأكيد كلمة المرور</FormLabel>
								<FormControl>
									<PasswordInputWithStrength
										placeholder="أعد إدخال كلمة المرور"
										showStrengthIndicator={false}
										maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="acceptTerms"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<div className="flex items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel className="text-sm font-normal leading-none [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
										<Link to="/terms">أُوافق على الشروط و الأحكام</Link>
									</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						disabled={isPending === "pending"}
						type="submit"
						className="w-full"
					>
						{isPending === "pending" ? <Icons.spinner /> : "إنشاء حساب"}
					</Button>
				</form>
			</Form>
		</div>
	);
}

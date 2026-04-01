import { UI_CONFIG } from "../../constants/config";
import { useResetPassword } from "../../hooks/use-reset-password";
import { Icons } from "@/components/icons";
import { PasswordInputWithStrength } from "@/components/inputs/password-input-with-strength";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

export default function ResetPasswordForm() {
	const { form, isPending, onSubmit } = useResetPassword();
	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>كلمة المرور الجديدة</FormLabel>
							<FormControl>
								<PasswordInputWithStrength
									{...field}
									placeholder="أدخل كلمة المرور الجديدة"
									maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
									requirements={[
										{
											regex: /.{6,}/,
											text: "6 أحرف على الأقل",
										},
										{
											regex: /\d/,
											text: "رقم واحد على الأقل",
										},
									]}
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

				<Button disabled={isPending} type="submit" className="w-full">
					{isPending ? <Icons.spinner /> : "إعادة تعيين كلمة المرور"}
				</Button>
			</form>
		</Form>
	);
}

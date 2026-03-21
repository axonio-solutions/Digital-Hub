import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { AtSignIcon, MoveLeftIcon } from "lucide-react";
import { AUTH_ROUTES } from "../../constants/config";
import { useForgotPassword } from "../../hooks/use-forgot-password";

export default function ForgotPasswordForm() {
	const { form, isPending, onSubmit } = useForgotPassword();
	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6 w-full max-w-md "
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>البريد الإلكتروني</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										{...field}
										className="peer ps-9"
										placeholder="أدخل بريدك الإلكتروني"
										type="email"
									/>
									<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
										<AtSignIcon size={16} strokeWidth={2} aria-hidden="true" />
									</div>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-2">
					<Button disabled={isPending} type="submit" className="w-full">
						{isPending ? <Icons.spinner /> : "إرسال تعليمات إعادة التعيين"}
					</Button>
					<Button variant="ghost" type="button" className="w-full" asChild>
						<Link to={AUTH_ROUTES.LOGIN}>
							<MoveLeftIcon className="w-4 h-4 me-2" />
							العودة لصفحة تسجيل الدخول
						</Link>
					</Button>
				</div>
			</form>
		</Form>
	);
}

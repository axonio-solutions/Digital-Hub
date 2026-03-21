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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { AtSignIcon, PhoneIcon } from "lucide-react";
import { AUTH_ROUTES, UI_CONFIG } from "../../constants/config";
import { useLogin } from "../../hooks/use-login";
import OAuthButtons from "../oauth-buttons";

export default function LoginForm() {
	const { form, loginMethod, setLoginMethod, isPending, onSubmit } = useLogin({
		onOTPSent: () => {},
	});

	return (
		<>
			<div className="flex flex-col gap-4">
				<OAuthButtons />

				<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
					<span className="relative z-10 bg-background px-2 text-muted-foreground">
						أو تابع باستخدام
					</span>
				</div>

				<Tabs
					dir="rtl"
					value={loginMethod}
					onValueChange={(value) => setLoginMethod(value as typeof loginMethod)}
				>
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
						<TabsTrigger value="phone">رقم الهاتف</TabsTrigger>
					</TabsList>

					<TabsContent value="email">
						<Form {...form}>
							<form
								className="flex flex-col gap-6"
								onSubmit={form.handleSubmit(onSubmit)}
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel className="block text-left rtl:text-right">
												البريد الإلكتروني
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														className="peer ps-9 rtl:ps-9 text-left rtl:text-right"
														placeholder="أدخل بريدك الإلكتروني"
														type="email"
														maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
													/>
													<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
														<AtSignIcon
															size={16}
															strokeWidth={2}
															aria-hidden="true"
														/>
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<div className="flex items-center justify-between">
												<FormLabel className="block text-left rtl:text-right">
													كلمة المرور
												</FormLabel>
												<Link
													to={AUTH_ROUTES.FORGOT_PASSWORD}
													className="text-sm underline-offset-4 hover:underline"
												>
													نسيت كلمة المرور؟
												</Link>
											</div>
											<FormControl>
												<PasswordInputWithStrength
													placeholder="أدخل كلمة المرور"
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
									{isPending ? <Icons.spinner /> : "تسجيل الدخول"}
								</Button>
							</form>
						</Form>
					</TabsContent>

					<TabsContent value="phone">
						<Form {...form}>
							<form
								className="flex flex-col gap-6"
								onSubmit={form.handleSubmit(onSubmit)}
							>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem className="space-y-0">
											<FormLabel className="block text-start">
												رقم الهاتف
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														{...field}
														className="peer pe-9 text-start"
														placeholder="أدخل رقم هاتفك"
														type="tel"
														maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
													/>
													<div className="pointer-events-none absolute inset-y-0 end-0 rtl:start-0 rtl:end-auto flex items-center justify-center pe-3 rtl:ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
														<PhoneIcon
															size={16}
															strokeWidth={2}
															aria-hidden="true"
														/>
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button disabled={isPending} type="submit" className="w-full">
									{isPending ? <Icons.spinner /> : "إرسال رمز التحقق"}
								</Button>
							</form>
						</Form>
					</TabsContent>
				</Tabs>
			</div>
			<div className="text-center mt-4 text-sm">
				ليس لديك حساب؟{" "}
				<Link
					to={AUTH_ROUTES.REGISTER}
					className="text-primary underline underline-offset-4 hover:text-primary"
				>
					تسجيل
				</Link>
			</div>
		</>
	);
}

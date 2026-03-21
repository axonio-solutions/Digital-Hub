import { PasswordInputWithStrength } from "@/components/inputs/password-input-with-strength";
import { PhoneInput } from "@/components/inputs/phone-input";
// src/features/account/account-settings.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { accountDetailsFn, changePasswordFn } from "@/fn/account-details";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UI_CONFIG } from "../auth/constants/config";
import { useAuthSuspense } from "../auth/hooks/use-auth";
import { authQueries } from "../auth/queries/auth-queries";
import Section from "../spaces/components/section";
import {
	type AccountDetailsFormValues,
	type PasswordResetFormValues,
	accountDetailsSchema,
	passwordResetSchema,
} from "./account.validations";
import { DeactivateAccountDialog } from "./components/deactivate-account-dialog";
import { DeleteAccountDialog } from "./components/delete-account-dialog";

export const AccountSettings = () => {
	const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const { data: accountDetails, isLoading: loadingAccountDetails } =
		useAuthSuspense();

	const detailsForm = useForm<AccountDetailsFormValues>({
		resolver: zodResolver(accountDetailsSchema),
		defaultValues: {
			fullName: accountDetails?.name ?? "",
			phoneNumber: accountDetails?.phone ?? "",
		},
	});

	const passwordForm = useForm<PasswordResetFormValues>({
		resolver: zodResolver(passwordResetSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const isDetailsFormDirty = detailsForm.formState.isDirty;
	const isPasswordRestFormDirty = passwordForm.formState.isDirty;
	const queryClient = useQueryClient();
	const accountDetailsMutation = useMutation({
		mutationFn: (updates: AccountDetailsFormValues) =>
			accountDetailsFn({ data: updates }),
		onMutate: async (updates) => {
			await queryClient.cancelQueries(authQueries.user());
			const previousData = queryClient.getQueryData(
				authQueries.user().queryKey,
			);
			if (previousData) {
				queryClient.setQueryData(authQueries.user().queryKey, {
					...previousData,
					name: updates.fullName,
					phone: updates.phoneNumber,
				});
			}
			toast.success("تم تعديل بياناتك بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				authQueries.user().queryKey,
				context?.previousData,
			);
			toast.error("حدث مُشكل أثناء تعديل البيانات");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: authQueries.user().queryKey,
				refetchType: "active",
			});
		},
	});

	const changePasswordMutation = useMutation({
		mutationFn: (updates: PasswordResetFormValues) =>
			changePasswordFn({ data: updates }),
		onMutate: async () => {
			toast.success("تم تعديل بياناتك بنجاح");
		},
		onError: (_, __) => {
			toast.error("حدث مُشكل أثناء تعديل البيانات");
		},
		onSettled: () => {},
	});

	const onSubmitDetails = (values: AccountDetailsFormValues) => {
		accountDetailsMutation.mutate(values);
		detailsForm.reset(values);
	};

	const onSubmitPassword = (values: PasswordResetFormValues) => {
		changePasswordMutation.mutate(values);
		passwordForm.reset();
	};

	return (
		<div className="space-y-8" dir="rtl">
			{/* Account Details Section */}
			<Form {...detailsForm}>
				<form
					onSubmit={detailsForm.handleSubmit(onSubmitDetails)}
					className="space-y-8"
				>
					<Section
						title="تفاصيل الحساب"
						description="يمكنك تعديل معلومات الحساب الشخصية الخاصة بك"
					>
						<div className="w-full flex-1 rounded-lg border p-6">
							<Alert className="bg-blue-50 border-blue-200">
								<AlertDescription className="text-blue-700">
									تأكد من إدخال بيانات صحيحة حتى نتمكن من التواصل معك بشكل فعال.
								</AlertDescription>
							</Alert>

							<div className="space-y-4 mt-6">
								<FormField
									control={detailsForm.control}
									name="fullName"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel>الاسم الكامل</FormLabel>
											<FormControl>
												{loadingAccountDetails ? (
													<Skeleton className="h-9 border w-full" />
												) : (
													<Input placeholder="أدخل اسمك الكامل" {...field} />
												)}
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={detailsForm.control}
									name="phoneNumber"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel>رقم الهاتف</FormLabel>
											<FormControl>
												{loadingAccountDetails ? (
													<Skeleton className="h-9 border w-full" />
												) : (
													<PhoneInput
														defaultCountry="SA"
														placeholder="5XXXXXXXX"
														{...field}
													/>
												)}
											</FormControl>
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={
										!isDetailsFormDirty || accountDetailsMutation.isPending
									}
								>
									حفظ التغييرات
								</Button>
							</div>
						</div>
					</Section>
				</form>
			</Form>

			{/* Password Reset Section */}
			<Form {...passwordForm}>
				<form
					onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
					className="space-y-8"
				>
					<Section
						title="تغيير كلمة المرور"
						description="يمكنك تغيير كلمة المرور الخاصة بحسابك من هنا"
					>
						<div className="w-full flex-1 rounded-lg border p-6">
							<div className="space-y-4">
								{/* Current Password */}
								<FormField
									control={passwordForm.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel>كلمة المرور الحالية</FormLabel>
											<FormControl>
												<PasswordInputWithStrength
													placeholder="ادخل كلمة المرور الحالية"
													showStrengthIndicator={false}
													maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* New Password */}
								<FormField
									control={passwordForm.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel>كلمة المرور الجديدة</FormLabel>
											<FormControl>
												<PasswordInputWithStrength
													placeholder="أدخل كلمة المرور الجديدة"
													requirements={[
														{ regex: /.{6,}/, text: "6 أحرف على الأقل" },
														{ regex: /\d/, text: "رقم واحد على الأقل" },
													]}
													maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Confirm Password */}
								<FormField
									control={passwordForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormLabel>تأكيد كلمة المرور</FormLabel>
											<FormControl>
												<PasswordInputWithStrength
													placeholder="ادخل كلمة المرور مرة اخرى"
													showStrengthIndicator={false}
													maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={
										!isPasswordRestFormDirty || changePasswordMutation.isPending
									}
								>
									تحديث كلمة المرور
								</Button>
							</div>
						</div>
					</Section>
				</form>
			</Form>

			{/* Danger Zone Section */}
			<Section title="منطقة الخطر" description="إجراءات خطيرة متعلقة بحسابك">
				<div className="w-full flex-1 rounded-lg border p-6">
					<div className="space-y-6">
						<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
							<div>
								<h3 className="text-lg font-medium mb-2">تعطيل الحساب</h3>
								<p className="text-sm mb-3">
									سيتم تعطيل حسابك مؤقتًا، ويمكنك إعادة تفعيله في أي وقت لاحقًا.
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setIsDeactivateOpen(true)}
								className="text-amber-600 border-amber-300 bg-amber-100 hover:bg-amber-200 cursor-pointer"
							>
								تعطيل الحساب
							</Button>
						</div>

						<div className="pt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between">
							<div>
								<h3 className="text-lg font-medium mb-2">حذف الحساب نهائيًا</h3>
								<p className="text-sm mb-3">
									هذا الإجراء سيؤدي لحذف حسابك وجميع بياناتك بشكل نهائي، ولا
									يمكن التراجع عنه أبدًا.
								</p>
							</div>
							<Button
								className="cursor-pointer"
								variant="destructive"
								onClick={() => setIsDeleteOpen(true)}
							>
								حذف الحساب نهائيًا
							</Button>
						</div>
					</div>
				</div>
			</Section>

			<DeactivateAccountDialog
				isOpen={isDeactivateOpen}
				onClose={() => setIsDeactivateOpen(false)}
			/>

			<DeleteAccountDialog
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
			/>
		</div>
	);
};

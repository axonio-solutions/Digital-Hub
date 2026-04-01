import { zodResolver } from "@hookform/resolvers/zod";
import { IconAt } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  useForm } from "react-hook-form";
import { toast } from "sonner";
import { cafesQueries } from "../information/informations.queries";
import {
	
	contactFormSchema
} from "../information/informations.validation";
import type {SubmitHandler} from "react-hook-form";
import type {
	CafeSelectWithCategories,
	UpdateCafeContactInformationInputs,
} from "../information/informations.types";
import type {ContactFormData} from "../information/informations.validation";
import { PhoneInput } from "@/components/inputs/phone-input";
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
import { TabsContent } from "@/components/ui/tabs";
import Section from "@/features/spaces/components/section";
import { updateCafeContactInformationsFn } from "@/fn/cafe-contact-informations";

const ContactForm = () => {
	const queryClient = useQueryClient();
	const data = queryClient.getQueryData(cafesQueries.details().queryKey);
	const initialData = data
		? {
				business_phone: data.business_phone as string,
				business_email: data.business_email as string,
			}
		: {
				business_phone: "",
				business_email: "",
			};

	const form = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: initialData,
	});

	const isDirty = form.formState.isDirty;

	const { mutate, isPending } = useMutation({
		mutationFn: (data: UpdateCafeContactInformationInputs) =>
			updateCafeContactInformationsFn({ data }),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: cafesQueries.details().queryKey,
			});

			const previousData = queryClient.getQueryData(
				cafesQueries.details().queryKey,
			);

			queryClient.setQueryData(cafesQueries.details().queryKey, (old) => {
				return {
					...(old as CafeSelectWithCategories),
					...variables,
				};
			});

			toast.success("تم تحديث معلومات الاتصال بنجاح");
			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafesQueries.details().queryKey,
				context?.previousData,
			);
			toast.error(
				"حدث خطأ أثناء تحديث تحديث معلومات الاتصال. يرجى المحاولة مرة أخرى.",
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: cafesQueries.details().queryKey,
			});
		},
	});

	const onSubmit: SubmitHandler<ContactFormData> = (data) => mutate(data);

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-4 w-full px-1 sm:px-4"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="business_phone"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>رقم الهاتف</FormLabel>
							<FormControl>
								<PhoneInput
									defaultCountry="SA"
									placeholder="5XXXXXXXX"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="business_email"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>البريد الإلكتروني</FormLabel>
							<FormControl>
								<div className="relative" dir="ltr">
									<Input
										{...field}
										className="peer ps-9"
										placeholder="example@domain.com"
										type="email"
									/>
									<div className="pointer-events-none absolute inset-y-0 flex items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50 start-0 ps-3">
										<IconAt size={16} strokeWidth={2} aria-hidden="true" />
									</div>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full"
					disabled={isPending || !isDirty}
				>
					حفظ التغييرات
				</Button>
			</form>
		</Form>
	);
};

// Contact Tab Content
export const ContactTabContent = () => {
	return (
		<TabsContent value="contact" className="flex flex-col px-4 lg:px-6">
			<Section
				title="معلومات الاتصال"
				description="حدد معلومات الاتصال الرسمية لمقهاك لتسهيل التواصل مع العملاء. تأكد من تحديث هذه المعلومات باستمرار لضمان إمكانية وصول العملاء إليك بسهولة"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<ContactForm />
				</div>
			</Section>
		</TabsContent>
	);
};

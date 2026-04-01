import { zodResolver } from "@hookform/resolvers/zod";
import {
	IconBrandFacebook,
	IconBrandInstagram,
	IconBrandSnapchat,
	IconBrandTiktok,
	IconBrandX,
	IconBrandYoutube,
	IconWorld,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { cafeSocialMediaQueries } from "./cafe-social-media.queries";
import { DEFAULT_SOCIAL_MEDIA_VALUES, SOCIAL_PLATFORMS } from "./constants";
import {
	
	
	
	socialFormSchema
} from "./validation";
import type {SocialMediaEntry, SocialMediaFormData, SocialMediaPlatform} from "./validation";
import { Icons as GlobalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import Section from "@/features/spaces/components/section";
import { updateCafeSocialMediaFn } from "@/fn/cafe-social-media";
import { useIsMobile } from "@/hooks/use-mobile";

const Icons = {
	IconBrandInstagram,
	IconBrandFacebook,
	IconBrandX,
	IconBrandTiktok,
	IconBrandSnapchat,
	IconBrandYoutube,
	IconWorld,
	spinner: GlobalIcons.spinner,
};

export const transformFormDataToEntries = (
	formData: SocialMediaFormData,
): Array<SocialMediaEntry> => {
	return Object.entries(formData)
		.filter(([_, handle]) => Boolean(handle?.trim()))
		.map(([platform, handle], index) => {
			const trimmedHandle = handle.trim();
			const typedPlatform = platform as SocialMediaPlatform;
			const prefix =
				SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]?.prefix ||
				"";

			return {
				platform: typedPlatform,
				handle: trimmedHandle,
				url: `${prefix}${trimmedHandle}`,
				display_order: index,
			};
		});
};

const SocialMediaForm = () => {
	const queryClient = useQueryClient();
	const { data } = useQuery(cafeSocialMediaQueries.details());

	const defaultValues = useMemo(() => {
		if (!data || !Array.isArray(data)) return DEFAULT_SOCIAL_MEDIA_VALUES;

		const values = { ...DEFAULT_SOCIAL_MEDIA_VALUES };

		for (const item of data) {
			if (item.platform in values) {
				values[item.platform as keyof SocialMediaFormData] = item.handle || "";
			}
		}

		return values;
	}, [data]);

	const form = useForm<SocialMediaFormData>({
		resolver: zodResolver(socialFormSchema),
		defaultValues: defaultValues,
	});

	const isDirty = form.formState.isDirty;

	const { mutate: updateSocialMedia, isPending } = useMutation({
		mutationFn: (formData: SocialMediaFormData) => {
			const entries = transformFormDataToEntries(formData);
			return updateCafeSocialMediaFn({ data: entries });
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries(cafeSocialMediaQueries.details());
			const previousData = queryClient.getQueryData(
				cafeSocialMediaQueries.details().queryKey,
			);

			queryClient.setQueryData(
				cafeSocialMediaQueries.details().queryKey,
				transformFormDataToEntries(newData).map(({ platform, handle }) => ({
					platform,
					handle,
				})),
			);

			toast.success("تم تحديث وسائل التواصل الاجتماعي");

			return { previousData };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				cafeSocialMediaQueries.details().queryKey,
				context?.previousData,
			);
			toast.error("فشل تحديث وسائل التواصل الاجتماعي");
		},
		onSettled: () =>
			queryClient.invalidateQueries(cafeSocialMediaQueries.details()),
	});

	const onSubmit = (data: SocialMediaFormData) => {
		updateSocialMedia(data);
	};

	const isMobile = useIsMobile();

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4 w-full px-1 sm:px-4"
			>
				{Object.entries(SOCIAL_PLATFORMS).map(([platform, config]) => {
					const Icon = Icons[config.icon as keyof typeof Icons];

					return (
						<FormField
							key={platform}
							control={form.control}
							name={platform as keyof SocialMediaFormData}
							render={({ field }) => (
								<FormItem dir="ltr" className="space-y-1">
									<div className="flex rounded-lg">
										<span className="inline-flex items-center gap-2 rounded-s-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
											<Icon className="size-4" />
											{!isMobile && config.prefix}
										</span>
										<FormControl>
											<Input
												{...field}
												className="-ms-px rounded-s-none shadow-none"
												placeholder={config.handle}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					);
				})}

				<Button
					type="submit"
					className="w-full"
					disabled={isPending || !isDirty}
				>
					حفظ الروابط
				</Button>
			</form>
		</Form>
	);
};

export const SocialTabContent = () => {
	return (
		<TabsContent value="social" className="flex flex-col px-4 lg:px-6">
			<Section
				title="وسائل التواصل الاجتماعي"
				description="اربط حسابات التواصل الاجتماعي الخاصة بمقهاك لزيادة تواجدك الرقمي. وجود روابط نشطة لحساباتك يساعد في بناء مجتمع قوي حول علامتك التجارية"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<SocialMediaForm />
				</div>
			</Section>
		</TabsContent>
	);
};

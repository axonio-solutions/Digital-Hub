import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPPORTED_LEAGUES } from "../../constants";
import { formatArabicDateTime } from "../../helpers";
import { eventsQueries } from "../../queries";
import {
	
	
	
	createMatchSchema
} from "../../schema";
import { AreasSelect } from "../areas-select";
import { CapacityPriceInputs } from "../capacity-price-inputs";
import { LeagueSelect } from "../league-select";
import { MatchSelect } from "../match-select";
import { PackagesSelect } from "../packages-select";
import type {CreateMatchFormData, MatchDetails, MatchEventTableRow} from "../../schema";
import { createFootballMatchFn } from "@/fn/events";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export const PRO_LEAGUE_ID = SUPPORTED_LEAGUES.find(
	(country) => country.country === "Saudi-Arabia",
)
	?.leagues.find((league) => league.name === "Pro League")
	?.id.toString();

interface AddMatchSheetProps {
	cafeId: string;
	onSuccess?: (match: MatchEventTableRow) => void;
	defaultValues?: CreateMatchFormData;
}

export function AddMatchSheet({ defaultValues }: AddMatchSheetProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);

	const form = useForm<CreateMatchFormData>({
		resolver: zodResolver(createMatchSchema),
		defaultValues: defaultValues || {
			league: PRO_LEAGUE_ID || "",
			match: "",
			areas: [],
			capacity: 0,
			packages: [],
		},
	});

	const createMatchMutation = useMutation({
		mutationFn: async (data: CreateMatchFormData) =>
			createFootballMatchFn({
				data: {
					formData: data,
					matchDetails: selectedMatch as MatchDetails,
				},
			}),
		onMutate: async (data) => {
			await queryClient.cancelQueries(eventsQueries.matchEvents());
			const previousEvents = queryClient.getQueryData(
				eventsQueries.matchEvents().queryKey,
			);

			const optimisticMatch = {
				id: `temp-id-${Date.now()}`,
				match: `${selectedMatch?.homeTeam} vs ${selectedMatch?.awayTeam}`,
				date: formatArabicDateTime(new Date(selectedMatch?.startTime as string))
					.date,
				time: formatArabicDateTime(new Date(selectedMatch?.startTime as string))
					.time,
				capacity: {
					total: data.capacity,
					remaining: data.capacity,
				},
				status: "upcoming",
			};

			queryClient.setQueryData(
				eventsQueries.matchEvents().queryKey,
				(old = []) => {
					return [...old, optimisticMatch];
				},
			);

			toast.success("تم إضافة المباراة بنجاح");
			setIsOpen(false);
			return { previousEvents };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				eventsQueries.matchEvents().queryKey,
				context?.previousEvents,
			);
			toast.error("حدث خطأ أثناء إضافة المباراة");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: eventsQueries.matchEvents().queryKey,
			});
			form.reset();
			setSelectedMatch(null);
		},
	});

	const onSubmit = async (data: CreateMatchFormData) => {
		if (!selectedMatch) {
			toast.error("يجب اختيار المباراة");
			return;
		}
		createMatchMutation.mutate(data);
	};

	const handleClose = () => {
		setIsOpen(false);
		form.reset();
		setSelectedMatch(null);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button size="sm">
					<IconPlus className="h-4 w-4" />
					إضافة مباراة
				</Button>
			</SheetTrigger>
			<SheetContent
				className="w-full sm:max-w-md p-0 overflow-hidden"
				side="right"
			>
				<SheetHeader className="p-6 mt-4 border-b">
					<SheetTitle className="text-xl font-bold">
						إضافة مباراة جديدة
					</SheetTitle>
					<SheetDescription>
						أدخل معلومات المباراة لإضافتها إلى المقهى
					</SheetDescription>
				</SheetHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea dir="rtl" className="h-[calc(100vh-14rem)]">
							<div className="px-6 py-4 space-y-6">
								<LeagueSelect form={form} />
								{/* Match Selection - Only shown when league is selected */}
								{form.watch("league") && (
									<div className="space-y-4">
										<MatchSelect form={form} onMatchSelect={setSelectedMatch} />
									</div>
								)}
								{/* Areas, Packages, and Pricing - Only shown when match is selected */}
								{form.watch("match") && (
									<>
										<AreasSelect form={form} />
										<PackagesSelect form={form} />
										<CapacityPriceInputs form={form} />
									</>
								)}
							</div>
						</ScrollArea>
						<SheetFooter className="p-6 border-t flex-row gap-2 sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className="flex-1 sm:flex-initial"
							>
								إلغاء
							</Button>
							<Button
								type="submit"
								disabled={!form.formState.isDirty}
								className="flex-1 sm:flex-initial"
							>
								إنشاء فعالية
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}

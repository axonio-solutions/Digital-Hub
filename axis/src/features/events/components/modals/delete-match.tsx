import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsQueries } from "../../queries";
import type { MatchEventTableRow } from "../../schema";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMatchEventFn } from "@/fn/events";

interface DeleteMatchDialogProps {
	matchData: MatchEventTableRow | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeleteMatchDialog({
	matchData,
	isOpen,
	onClose,
	onSuccess,
}: DeleteMatchDialogProps) {
	const [inputValue, setInputValue] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const inputId = React.useId();
	const queryClient = useQueryClient();

	const deleteMatchMutation = useMutation({
		mutationFn: (matchId: string) => deleteMatchEventFn({ data: matchId }),
		onMutate: async (matchId) => {
			await queryClient.cancelQueries(eventsQueries.matchEvents());
			const previousMatchEvents = queryClient.getQueryData(
				eventsQueries.matchEvents().queryKey,
			);
			queryClient.setQueryData(
				eventsQueries.matchEvents().queryKey,
				(old = []) => old.filter((match) => match.id !== matchId),
			);
			return { previousMatchEvents };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				eventsQueries.matchEvents().queryKey,
				context?.previousMatchEvents,
			);
			toast.error("حدث خطأ أثناء حذف المباراة");
		},
		onSuccess: () => {
			toast.success("تم حذف المباراة بنجاح");
			onSuccess?.();
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: eventsQueries.matchEvents().queryKey,
			});
			setIsDeleting(false);
			setInputValue("");
			onClose();
		},
	});

	const handleDelete = () => {
		if (!matchData) return;

		try {
			setIsDeleting(true);
			deleteMatchMutation.mutate(matchData.id);
		} catch (error) {
			toast.error("حدث خطأ أثناء حذف المباراة", {
				description: "يرجى المحاولة مرة أخرى",
			});
		}
	};

	if (!matchData) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<div className="flex flex-col items-center gap-2">
					<div
						className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600"
						aria-hidden="true"
					>
						<IconAlertCircle className="size-5" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center text-lg">
							تأكيد حذف المُباراة
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							هذا الإجراء لا يمكن التراجع عنه. للتأكيد، الرجاء كتابة اسم
							المباراة{" "}
							<span className="font-medium text-foreground">
								{matchData.match}
							</span>
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="space-y-5">
					<div className="*:not-first:mt-2">
						<Label htmlFor={inputId} className="text-base">
							اسم المباراة
						</Label>
						<Input
							id={inputId}
							dir="rtl"
							type="text"
							placeholder={`اكتب "${matchData.match}" للتأكيد`}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="mt-1.5"
						/>
					</div>
					<DialogFooter className="sm:justify-center gap-2">
						<DialogClose asChild>
							<Button type="button" variant="outline" className="flex-1">
								إلغاء
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							className="flex-1"
							disabled={inputValue !== matchData.match || isDeleting}
							onClick={handleDelete}
						>
							{isDeleting ? "جاري الحذف..." : "حذف"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

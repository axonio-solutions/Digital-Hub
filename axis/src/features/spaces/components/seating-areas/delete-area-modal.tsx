import { useId, useState } from "react";
import { toast } from "sonner";

import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { seatingAreasQueries } from "./seating-areas.queries";
import type { Area } from "./seating-areas.types";
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
import { deleteSeatingAreaFn } from "@/fn/seating-areas";

interface DeleteMatchDialogProps {
	data: Area;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeleteAreaDialog({
	data,
	isOpen,
	onClose,
	onSuccess,
}: DeleteMatchDialogProps) {
	const queryClient = useQueryClient();
	const [inputValue, setInputValue] = useState("");
	const inputId = useId();

	const { mutate } = useMutation({
		mutationFn: (areaId: string) => deleteSeatingAreaFn({ data: areaId }),
		onMutate: async (areaId) => {
			await queryClient.cancelQueries(seatingAreasQueries.list());
			const previousAreas = queryClient.getQueryData<Array<Area>>(
				seatingAreasQueries.list().queryKey,
			);

			queryClient.setQueryData(
				seatingAreasQueries.list().queryKey,
				(old: Array<Area> = []) => old.filter((area) => area.id !== areaId),
			);

			toast.success("تم حذف المنطقة بنجاح");
			return { previousAreas };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				seatingAreasQueries.list().queryKey,
				context?.previousAreas,
			);
			toast.error("حدث خطأ أثناء حذف المنطقة");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: seatingAreasQueries.list().queryKey,
			});
		},
	});

	const handleDelete = async (id: string) => {
		mutate(id);
		onClose();
		setInputValue("");
		onSuccess?.();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
					setInputValue("");
				}
			}}
		>
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
							تأكيد حذف المنطقة
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							هذا الإجراء لا يمكن التراجع عنه. للتأكيد، الرجاء كتابة اسم المنقطة
							بالعربي{" "}
							<span className="font-medium text-foreground">
								{data.name_ar}
							</span>{" "}
							أو بالإنجليزي{" "}
							<span className="font-medium text-foreground">
								{data.name_en}
							</span>
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="space-y-5">
					<div className="*:not-first:mt-2">
						<Label htmlFor={inputId} className="text-base">
							اسم المنطقة
						</Label>
						<Input
							id={inputId}
							dir="rtl"
							type="text"
							placeholder={`اكتب "${data.name_ar}" أو "${data.name_en}" للتأكيد`}
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
							disabled={![data.name_ar, data.name_en].includes(inputValue)}
							onClick={() => handleDelete(data.id)}
						>
							حذف
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

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
import { IconAlertCircle } from "@tabler/icons-react";
import type { schema } from "../cafe-reservations-table";

interface DeleteReservationDialogProps {
	reservation: z.infer<typeof schema> | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeleteReservationDialog({
	reservation,
	isOpen,
	onClose,
	onSuccess,
}: DeleteReservationDialogProps) {
	const [inputValue, setInputValue] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const inputId = React.useId();

	if (!reservation) return null;

	const handleDelete = async () => {
		try {
			setIsDeleting(true);

			// Mock API call - replace with your actual delete API
			await new Promise((resolve) => setTimeout(resolve, 800));

			toast.success(`تم حذف حجز "${reservation.guestName}" بنجاح`);
			onClose();
			onSuccess?.();
		} catch (error) {
			toast.error("حدث خطأ أثناء حذف الحجز", {
				description: "يرجى المحاولة مرة أخرى",
			});
		} finally {
			setIsDeleting(false);
			setInputValue("");
		}
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
							تأكيد حذف الحجز
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							هذا الإجراء لا يمكن التراجع عنه. للتأكيد، الرجاء كتابة اسم الضيف{" "}
							<span className="font-medium text-foreground">
								{reservation.guestName}
							</span>
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="space-y-5">
					<div className="*:not-first:mt-2">
						<Label htmlFor={inputId} className="text-base">
							اسم الضيف
						</Label>
						<Input
							id={inputId}
							dir="rtl"
							type="text"
							placeholder={`اكتب "${reservation.guestName}" للتأكيد`}
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
							disabled={inputValue !== reservation.guestName || isDeleting}
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

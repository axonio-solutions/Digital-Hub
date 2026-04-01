import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
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
import { AUTH_ROUTES } from "@/features/auth/constants/config";
import { useAuthSuspense } from "@/features/auth/hooks/use-auth";
import { authClient } from "@/lib/auth-client";

interface DeleteAccountDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeleteAccountDialog({
	isOpen,
	onClose,
	onSuccess,
}: DeleteAccountDialogProps) {
	const { data: user } = useAuthSuspense();
	const [inputValue, setInputValue] = useState("");
	const inputId = useId();
	const router = useRouter();

	if (!user) {
		return null;
	}

	const handleDelete = async () => {
		try {
			// Delete the user account
			await authClient.deleteUser();

			// Sign out the user
			await authClient.signOut();

			toast.success("تم حذف الحساب بنجاح");
			onClose();
			setInputValue("");
			onSuccess?.();

			// Navigate to login page
			router.navigate({ to: AUTH_ROUTES.LOGIN });
		} catch (error) {
			console.error("Error deleting account:", error);
			toast.error("حدث خطأ أثناء حذف الحساب");
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
							تأكيد حذف الحساب
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							هذا الإجراء لا يمكن التراجع عنه. للتأكيد، الرجاء كتابة اسمك{" "}
							<span className="font-medium text-foreground">{user.name}</span>
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="space-y-5">
					<div className="*:not-first:mt-2">
						<Label htmlFor={inputId} className="text-base">
							الاسم الكامل
						</Label>
						<Input
							id={inputId}
							dir="rtl"
							type="text"
							placeholder={`اكتب "${user.name}" للتأكيد`}
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
							disabled={inputValue !== user.name}
							onClick={handleDelete}
						>
							حذف الحساب
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

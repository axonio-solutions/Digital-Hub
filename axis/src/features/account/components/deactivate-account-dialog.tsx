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
import { deactivateAccountFn } from "@/fn/account-details";
import { authClient } from "@/lib/auth-client";

interface DeactivateAccountDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeactivateAccountDialog({
	isOpen,
	onClose,
	onSuccess,
}: DeactivateAccountDialogProps) {
	const { data: user } = useAuthSuspense();
	const [inputValue, setInputValue] = useState("");
	const inputId = useId();
	const router = useRouter();

	if (!user) {
		return null;
	}

	const handleDeactivate = async () => {
		try {
			// Deactivate the account using the server function
			await deactivateAccountFn();

			toast.success("تم تعطيل الحساب بنجاح");
			onClose();
			setInputValue("");
			onSuccess?.();

			// Sign out the user after deactivation
			await authClient.signOut();

			// Navigate to login page
			router.navigate({ to: AUTH_ROUTES.LOGIN });
		} catch (error) {
			console.error("Error deactivating account:", error);
			toast.error("حدث خطأ أثناء تعطيل الحساب");
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
						className="flex size-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600"
						aria-hidden="true"
					>
						<IconAlertCircle className="size-5" />
					</div>
					<DialogHeader>
						<DialogTitle className="sm:text-center text-lg">
							تأكيد تعطيل الحساب
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							سيتم تعطيل حسابك مؤقتًا. للتأكيد، الرجاء كتابة اسمك{" "}
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
							onClick={handleDeactivate}
						>
							تعطيل الحساب
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { packagesQueries } from "../../packages-queries";
import type { PackageWithItems } from "../../packages.types";
import { Icons } from "@/components/icons";
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
import { deletePackageFn } from "@/fn/packages";

interface DeletePackageDialogProps {
	packageData: Pick<PackageWithItems, "id" | "name">;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function DeletePackageDialog({
	packageData,
	isOpen,
	onClose,
	onSuccess,
}: DeletePackageDialogProps) {
	if (!packageData) return null;

	const queryClient = useQueryClient();
	const [inputValue, setInputValue] = useState("");
	const inputId = React.useId();

	const deletePackageMutation = useMutation({
		mutationFn: (packageId: string) => deletePackageFn({ data: packageId }),
		onMutate: async (packageId) => {
			await queryClient.cancelQueries(packagesQueries.list());
			const previousPackages = queryClient.getQueryData<Array<PackageWithItems>>(
				packagesQueries.list().queryKey,
			);
			queryClient.setQueryData(packagesQueries.list().queryKey, (old = []) => {
				return old.filter((pkg) => pkg.id !== packageId);
			});
			toast.success("تم حذف الباكيج بنجاح");
			return { previousPackages };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData(
				packagesQueries.list().queryKey,
				context?.previousPackages,
			);
			toast.error("حدث خطأ أثناء حذف الباكيج");
		},
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: packagesQueries.list().queryKey,
			}),
	});

	const handleDelete = async () => {
		deletePackageMutation.mutate(packageData.id);
		onClose();
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
							تأكيد حذف الباكيج
						</DialogTitle>
						<DialogDescription className="sm:text-center text-balance">
							هذا الإجراء لا يمكن التراجع عنه. للتأكيد، الرجاء كتابة اسم الباكيج{" "}
							<span className="font-medium text-foreground">
								{packageData.name}
							</span>
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="space-y-5">
					<div className="*:not-first:mt-2">
						<Input
							id={inputId}
							dir="rtl"
							type="text"
							placeholder={`اكتب "${packageData.name}" للتأكيد`}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="mt-1.5"
						/>
					</div>
					<DialogFooter className="sm:justify-center gap-2">
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								className="flex-1 cursor-pointer"
							>
								إلغاء
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							className="flex-1 cursor-pointer"
							disabled={
								inputValue !== packageData.name ||
								deletePackageMutation.isPending
							}
							onClick={handleDelete}
						>
							{deletePackageMutation.isPending ? <Icons.spinner /> : "حذف"}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import type { CreatePackageInput, PackageFormValues } from "./packages.types";

export function prepareCreatePackageData(
	formData: PackageFormValues,
	cafeId: string,
): CreatePackageInput {
	return {
		cafe_id: cafeId,
		name: formData.name.trim(),
		status: formData.isActive ? "active" : "inactive",
		items: formData.items.map((item) => ({
			name: item.name.trim(),
			price: Number(item.price),
		})),
	};
}

import { z } from "zod";
import {
	createPackage,
	deleteMultiplePackages,
	deletePackage,
	getAllPackages,
	updatePackage,
} from "./packages.data-access";
import type { CreatePackageInput, UpdatePackageInput } from "./packages.types";
import {
	createPackageSchema,
	updatePackageSchema,
} from "./packages.validation";

export async function getAllPackagesUseCase(cafeId: string) {
	try {
		const packages = await getAllPackages(cafeId);
		return packages;
	} catch (error) {
		console.error("Error fetching packages:", error);
		throw error;
	}
}

export async function createPackageUseCase(formData: CreatePackageInput) {
	try {
		createPackageSchema.parse(formData);
		const result = await createPackage(formData);
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: "بيانات الباكيج غير صالحة",
				validationErrors: error.format(),
			};
		}
		return {
			success: false,
			error: "حدث خطأ أثناء إنشاء الباكيج",
		};
	}
}

export async function updatePackageUseCase(formData: UpdatePackageInput) {
	try {
		updatePackageSchema.parse(formData);
		const result = await updatePackage(formData);
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: "بيانات الباكيج غير صالحة",
				validationErrors: error.format(),
			};
		}
		return {
			success: false,
			error: "حدث خطأ أثناء تحديث الباكيج",
		};
	}
}

export async function deletePackageUseCase(packageId: string) {
	try {
		await deletePackage(packageId);
		return {
			success: true,
		};
	} catch (error) {
		console.error("Error deleting package:", error);
		return {
			success: false,
			error: "حدث خطأ أثناء حذف الباكيج",
		};
	}
}

export async function deleteMultiplePackagesUseCase(packageIds: string[]) {
	try {
		await deleteMultiplePackages(packageIds);
		return {
			success: true,
		};
	} catch (error) {
		console.error("Error deleting multiple packages:", error);
		return {
			success: false,
			error: "حدث خطأ أثناء حذف الباكيجات",
		};
	}
}

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import { prepareCreatePackageData } from "@/features/packages/packages.helpers";
import {
	createPackageUseCase,
	deleteMultiplePackagesUseCase,
	deletePackageUseCase,
	getAllPackagesUseCase,
	updatePackageUseCase,
} from "@/features/packages/packages.use-cases";
import {
	packageFormSchema,
	updatePackageSchema,
} from "@/features/packages/packages.validation";

export const fetchPackagesFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const packages = await getAllPackagesUseCase(context.cafeId);
			return packages;
		} catch (error) {
			console.error("Failed to fetch packages:", error);
			throw error;
		}
	});

export const createPackageFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(packageFormSchema)
	.handler(async ({ data, context }) => {
		if (!context?.cafeId) {
			return; // TODO: handle this case properly
		}
		const submissionData = prepareCreatePackageData(data, context.cafeId);
		const pkg = await createPackageUseCase(submissionData);

		return pkg;
	});

export const updatePackageFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(updatePackageSchema)
	.handler(async ({ data }) => {
		const result = await updatePackageUseCase(data);
		return result;
	});

export const deletePackageFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator((d: string) => d)
	.handler(async ({ data }) => {
		return await deletePackageUseCase(data);
	});

export const deleteMultiplePackagesFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator((d: Array<string>) => d)
	.handler(async ({ data }) => {
		return await deleteMultiplePackagesUseCase(data);
	});

import { eq, inArray } from "drizzle-orm";
import type { CreatePackageInput, UpdatePackageInput } from "./packages.types";
import { db } from "@/db";
import { packageItems, packages } from "@/db/schema/packages-schema";

export async function getAllPackages(cafeId: string) {
	try {
		const allPackages = await db.query.packages.findMany({
			columns: {
				id: true,
				name: true,
				status: true,
			},
			where: eq(packages.cafe_id, cafeId),
			with: {
				items: {
					columns: {
						id: true,
						name: true,
						price: true,
					},
				},
			},
		});
		return allPackages;
	} catch (error) {
		console.error("Error fetching packages:", error);
		throw error;
	}
}

export async function getPackageById(packageId: string) {
	try {
		// Get the package by ID
		const pkg = await db.query.packages.findFirst({
			where: eq(packages.id, packageId),
			with: {
				items: true,
			},
		});

		return pkg;
	} catch (error) {
		console.error("Error fetching package by ID:", error);
		throw error;
	}
}

export async function createPackage(input: CreatePackageInput) {
	return await db.transaction(async (tx) => {
		const [newPackage] = await tx
			.insert(packages)
			.values({
				cafe_id: input.cafe_id,
				name: input.name,
				status: input.status,
			})
			.returning();

		const packageItemsToInsert = input.items.map((item) => ({
			package_id: newPackage.id,
			name: item.name,
			price: String(item.price),
		}));

		const newItems = await tx
			.insert(packageItems)
			.values(packageItemsToInsert)
			.returning();

		return {
			id: newPackage.id,
			name: newPackage.name,
			status: newPackage.status,
			items: newItems.map((item) => ({
				id: item.id,
				name: item.name,
				price: Number(item.price),
			})),
		};
	});
}

export async function updatePackage(input: UpdatePackageInput) {
	return await db.transaction(async (tx) => {
		if (input.name || input.status !== undefined) {
			await tx
				.update(packages)
				.set({
					name: input.name,
					status: input.status,
				})
				.where(eq(packages.id, input.id));
		}

		if (input.items && input.items.length > 0) {
			const itemsToDelete = input.items
				.filter((item) => item._delete && item.id)
				.map((item) => item.id)
				.filter(Boolean) as Array<string>;

			if (itemsToDelete.length > 0) {
				await tx
					.delete(packageItems)
					.where(inArray(packageItems.id, itemsToDelete));
			}

			const itemsToUpdate = input.items.filter(
				(item) => item.id && !item._delete,
			);

			for (const item of itemsToUpdate) {
				if (item.id) {
					await tx
						.update(packageItems)
						.set({
							name: item.name,
							price: String(item.price),
						})
						.where(eq(packageItems.id, item.id));
				}
			}

			const itemsToInsert = input.items
				.filter((item) => !item.id && !item._delete)
				.map((item) => ({
					package_id: input.id,
					name: item.name,
					price: String(item.price),
				}));

			if (itemsToInsert.length > 0) {
				await tx.insert(packageItems).values(itemsToInsert);
			}
		}

		const updatedPackage = await tx.query.packages.findFirst({
			where: eq(packages.id, input.id),
			with: {
				items: {
					columns: {
						id: true,
						name: true,
						price: true,
					},
				},
			},
		});

		if (!updatedPackage) {
			throw new Error(`Package with ID ${input.id} not found after update`);
		}

		return {
			id: updatedPackage.id,
			name: updatedPackage.name,
			status: updatedPackage.status,
			items: updatedPackage.items.map((item) => ({
				id: item.id,
				name: item.name,
				price: Number(item.price),
			})),
		};
	});
}

export async function deletePackage(packageId: string): Promise<void> {
	try {
		await db.delete(packages).where(eq(packages.id, packageId));
	} catch (error) {
		console.error("Error deleting package:", error);
		throw error;
	}
}

export async function deleteMultiplePackages(
	packageIds: Array<string>,
): Promise<void> {
	try {
		await db.delete(packages).where(inArray(packages.id, packageIds));
	} catch (error) {
		console.error("Error deleting multiple packages:", error);
		throw error;
	}
}

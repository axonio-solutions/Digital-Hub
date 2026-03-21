import type { packageItems, packages } from "@/db/schema/packages-schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type {
	createPackageSchema,
	packageFormSchema,
	packageItemSchema,
	packageTableSchema,
	updatePackageSchema,
} from "./packages.validation";

export type PackageInsert = InferInsertModel<typeof packages>;
export type PackageSelect = InferSelectModel<typeof packages>;
export type PackageItemInsert = InferInsertModel<typeof packageItems>;
export type PackageItemSelect = InferSelectModel<typeof packageItems>;

export type PackageTableRow = z.infer<typeof packageTableSchema>;
export type PackageItem = z.infer<typeof packageItemSchema>;

export type PackageFormValues = z.infer<typeof packageFormSchema>;
export type CreatePackageFormValues = z.infer<typeof createPackageSchema>;
export type UpdatePackageFormValues = z.infer<typeof updatePackageSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export type PackageWithItems = Pick<PackageSelect, "id" | "name" | "status"> & {
	items: Pick<PackageItemSelect, "id" | "name" | "price">[];
};

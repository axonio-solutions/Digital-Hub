import { z } from "zod";
import type { PackageItemSelect, PackageWithItems } from "./packages.types";

export const packageTableSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	price: z.string(),
	status: z.string(),
});

export const packageItemSchema = z.object({
	name: z.string().min(1, {
		message: "اسم العنصر مطلوب",
	}),
	price: z.number().min(1, {
		message: "السعر يجب أن يكون أكبر من صفر",
	}),
});

export const packageItemUpdateSchema = packageItemSchema.extend({
	id: z.string().uuid().optional(),
	_delete: z.boolean().optional(),
});

export const packageFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "يجب أن يحتوي اسم الباكيج على حرفين على الأقل" }),
	items: z
		.array(packageItemSchema)
		.min(1, { message: "يجب إضافة عنصر واحد على الأقل" }),
	isActive: z.boolean().default(false),
});

export const createPackageSchema = z.object({
	cafe_id: z.string().uuid({ message: "معرف المقهى غير صالح" }),
	name: z
		.string()
		.min(2, { message: "يجب أن يحتوي اسم الباكيج على حرفين على الأقل" }),
	status: z.enum(["active", "inactive"]).default("inactive"),
	items: z
		.array(packageItemSchema)
		.min(1, { message: "يجب إضافة عنصر واحد على الأقل" }),
});

export const updatePackageSchema = z.object({
	id: z.string().uuid({ message: "معرف الباكيج غير صالح" }),
	name: z.string().min(2).optional(),
	status: z.enum(["active", "inactive"]).optional(),
	items: z.array(packageItemUpdateSchema).optional(),
});

export function transformPackageToTableRow(
	packageWithItems: PackageWithItems,
): z.infer<typeof packageTableSchema> {
	return {
		id: packageWithItems.id,
		name: packageWithItems.name,
		price: calculateTotalPrice(packageWithItems.items).toString(),
		status: packageWithItems.status,
	};
}

function calculateTotalPrice(items: PackageItemSelect[]): number {
	return items.reduce((sum, item) => sum + Number(item.price), 0);
}

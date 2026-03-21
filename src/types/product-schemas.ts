import { z } from "zod";

export const productFormSchema = z.object({
    partName: z.string().min(2, "Part name must be at least 2 characters"),
    description: z.string().optional(),
    status: z.enum(["published", "draft", "archived"]),
    vehicleBrand: z.string().min(1, "Vehicle brand is required"),
    vehicleModel: z.string().min(1, "Vehicle model is required"),
    modelYear: z.string().min(1, "Model year is required"),
    vinNumber: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    variations: z.array(z.object({
        type: z.string(),
        value: z.string()
    })).default([]),
    expectedPrice: z.string().optional(),
    budgetType: z.enum(["negotiable", "fixed", "range"]).default("negotiable"),
    template: z.string().default("default"),
    taxClass: z.string().optional(),
    vatAmount: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

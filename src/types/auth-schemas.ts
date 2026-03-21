import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["buyer", "seller"]),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    // Seller specific fields (optional in schema, but can be validated conditionally)
    storeName: z.string().optional(),
    companyAddress: z.string().optional(),
    commercialRegister: z.string().optional(),
}).refine((data) => {
    if (data.role === "seller") {
        return !!data.storeName && !!data.companyAddress && !!data.commercialRegister;
    }
    return true;
}, {
    message: "Seller fields are required for professional accounts",
    path: ["storeName"], // Just showing it on storeName for now
});

export type RegisterInput = z.infer<typeof registerSchema>;

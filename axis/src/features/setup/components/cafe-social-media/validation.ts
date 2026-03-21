import { z } from "zod";
import type { SOCIAL_PLATFORMS } from "./constants";

export const socialFormSchema = z.object({
	instagram: z.string().optional(),
	facebook: z.string().optional(),
	x: z.string().optional(),
	tiktok: z.string().optional(),
	snapchat: z.string().optional(),
	youtube: z.string().optional(),
	website: z.string().optional(),
});

export type SocialMediaFormData = z.infer<typeof socialFormSchema>;

export type SocialMediaPlatform = keyof typeof SOCIAL_PLATFORMS;

export const socialMediaSchema = z.array(
	z.object({
		platform: z.enum([
			"instagram",
			"facebook",
			"x",
			"tiktok",
			"snapchat",
			"youtube",
			"linkedin",
			"website",
		]),
		handle: z.string().trim().min(1, "Handle is required"),
		url: z.string().url("Invalid URL format"),
		display_order: z.number().int().min(0),
	}),
);

export type SocialMediaEntry = z.infer<typeof socialMediaSchema>[0];

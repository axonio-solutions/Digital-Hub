import { authMiddleware } from "@/features/auth/guards/auth";
import {
	getCafeSocialMediaUseCase,
	updateCafeSocialMediaUseCase,
} from "@/features/setup/components/cafe-social-media/cafe-social-media.use-cases";
import { socialMediaSchema } from "@/features/setup/components/cafe-social-media/validation";
import { createServerFn } from "@tanstack/react-start";

export const fetchCafeSocialMediaFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		return await getCafeSocialMediaUseCase(cafeId);
	});

export const updateCafeSocialMediaFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(socialMediaSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await updateCafeSocialMediaUseCase(cafeId, data);
	});

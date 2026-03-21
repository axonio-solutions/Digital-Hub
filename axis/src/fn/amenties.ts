import { authMiddleware } from "@/features/auth/guards/auth";
import { updateAmenitiesUseCase } from "@/features/setup/components/amenities/amenities.use-cases";
import { amenitiesSchema } from "@/features/setup/components/information/informations.validation";
import { createServerFn } from "@tanstack/react-start";

export const updateAmenitiesFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(amenitiesSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await updateAmenitiesUseCase(data, cafeId);
	});

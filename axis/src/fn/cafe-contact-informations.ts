import { authMiddleware } from "@/features/auth/guards/auth";
import { updateCafeContactInformationsUseCase } from "@/features/setup/components/cafe-contact-information/cafe-contact-information.use-cases";
import { contactFormSchema } from "@/features/setup/components/information/informations.validation";
import { createServerFn } from "@tanstack/react-start";

export const updateCafeContactInformationsFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(contactFormSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await updateCafeContactInformationsUseCase(data, cafeId);
	});

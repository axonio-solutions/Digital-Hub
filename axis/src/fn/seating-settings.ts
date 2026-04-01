import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import {
	updateMaxCapacityUseCase,
	updateSeatingSettingsUseCase,
} from "@/features/spaces/components/seating-settings/seating-settings.use-cases";
import { bookingSettingsSchema } from "@/features/spaces/components/seating-settings/validation";

export const updateSeatingSettingsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(bookingSettingsSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await updateSeatingSettingsUseCase(cafeId, data);
	});

export const updateMaxCapacityFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((d: number) => d)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await updateMaxCapacityUseCase(cafeId, data);
	});

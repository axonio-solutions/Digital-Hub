import { authMiddleware } from "@/features/auth/guards/auth";
import {
	getCafeInformationUseCase,
	getSpaceSettingsUseCase,
	updateCafeInformationUseCase,
} from "@/features/setup/components/information/informations.use-cases";
import { cafeInformationFormSchema } from "@/features/setup/components/information/informations.validation";
import { fetchCafeOperatingHours, updateHours } from "@/features/setup/components/operating-hours/lib/use-cases";
import { operatingHoursSchema } from "@/features/setup/components/operating-hours/lib/validation";
import { createServerFn } from "@tanstack/react-start";

export const fetchCafeInformationFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context: { cafeId } }) => {
		if (!cafeId) return;
		return await getCafeInformationUseCase(cafeId);
	});

export const updateCafeInformationFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(cafeInformationFormSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return; // TODO: handle this case properly
		}
		return await updateCafeInformationUseCase(data, cafeId);
	});

export const fetchCafeOperatingHoursFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context: { cafeId } }) => {
		if (!cafeId) return;
		return await fetchCafeOperatingHours(cafeId);
	});

export const updateCafeOperatingHoursFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(operatingHoursSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return; // TODO: handle this case properly
		}
		return await updateHours(cafeId, data);
	});

export const fetchSpaceSettingsFn = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context: { cafeId } }) => {
		if (!cafeId) return;
		return await getSpaceSettingsUseCase(cafeId);
	});

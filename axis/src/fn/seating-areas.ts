import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import {
	createSeatingAreaUseCase,
	deleteSeatingAreaUseCase,
	getSeatingAreasUseCase,
	updateSeatingAreaUseCase,
} from "@/features/spaces/components/seating-areas/seating-areas.use-cases";
import {
	areaSchema,
	updateAreaSchema,
} from "@/features/spaces/components/seating-areas/seating-areas.validations";

export const fetchSeatingAreasFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])

	.handler(async ({ context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		return await getSeatingAreasUseCase(cafeId);
	});

export const createSeatingAreaFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.validator(areaSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		await createSeatingAreaUseCase(cafeId, data);
	});

export const deleteSeatingAreaFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((d: string) => d)
	.handler(async ({ data: id }) => {
		return await deleteSeatingAreaUseCase(id);
	});

export const updateSeatingAreaFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(updateAreaSchema)
	.handler(async ({ data, context: { cafeId } }) => {
		if (!cafeId) {
			return;
		}
		return await updateSeatingAreaUseCase(data);
	});

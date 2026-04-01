import type {
	CafeInformationFormValues,
	CafeSelectWithCategories,
} from "./informations.types";

export function transformCafeToFormValues(
	cafe: CafeSelectWithCategories,
): CafeInformationFormValues {
	return {
		name_ar: cafe.name_ar || "",
		name_en: cafe.name_en || "",
		slug: cafe.slug || "",
		description: cafe.description || "",
		administrative_region: cafe.administrative_region || "",
		governorate: cafe.governorate || "",
		street: cafe.street || "",
		type_id: cafe.type_id || "",
		categories: cafe.categories.map((c) => c.category_id) || [],
	};
}

export const formatCafeSlug = (value: string, cleanup = false) => {
	let slug = value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "");

	if (cleanup) {
		slug = slug.replace(/-+/g, "-");
	}

	return slug;
};

interface Region {
	region_id: number;
	name_ar: string;
	name_en: string;
}

interface City {
	city_id: number;
	region_id: number;
	name_ar: string;
	name_en: string;
}

export const preprocessLocationData = (
	regionsData: Array<Region>,
	citiesData: Array<City>,
) => {
	const citiesByRegion = regionsData.reduce(
		(acc, region) => {
			const regionCities = citiesData
				.filter((city) => city.region_id === region.region_id)
				.map((city) => ({
					id: city.city_id.toString(),
					name: city.name_ar,
				}));

			acc[region.region_id.toString()] = regionCities;
			return acc;
		},
		{} as Record<string, Array<{ id: string; name: string }>>,
	);

	return {
		regions: regionsData.map((region) => region.name_ar),
		citiesByRegion,
	};
};

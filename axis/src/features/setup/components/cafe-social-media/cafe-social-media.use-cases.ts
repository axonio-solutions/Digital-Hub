import {
	getCafeSocialMedia,
	updateCafeSocialMedia,
} from "./cafe-social-media.data-access";
import type { SocialMediaEntry } from "./validation";

export const getCafeSocialMediaUseCase = async (cafeId: string) => {
	try {
		const result = await getCafeSocialMedia(cafeId);
		return result;
	} catch (error) {
		console.error("Error fetching cafe social media");
		throw error;
	}
};

export const updateCafeSocialMediaUseCase = async (
	cafeId: string,
	entries: Array<SocialMediaEntry>,
) => {
	try {
		const result = await updateCafeSocialMedia(cafeId, entries);
		return result;
	} catch (error) {
		console.error("Error update cafe social media");
		throw error;
	}
};

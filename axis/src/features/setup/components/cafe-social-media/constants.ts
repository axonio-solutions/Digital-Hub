import type { SocialMediaFormData } from "./validation";

export const SOCIAL_PLATFORMS = {
	instagram: {
		icon: "IconBrandInstagram",
		prefix: "https://instagram.com/",
		handle: "instagram_handle",
	},
	facebook: {
		icon: "IconBrandFacebook",
		prefix: "https://facebook.com/",
		handle: "facebook_handle",
	},
	x: {
		icon: "IconBrandX",
		prefix: "https://x.com/",
		handle: "x_handle",
	},
	tiktok: {
		icon: "IconBrandTiktok",
		prefix: "https://tiktok.com/@",
		handle: "tiktok_handle",
	},
	snapchat: {
		icon: "IconBrandSnapchat",
		prefix: "https://snapchat.com/add/",
		handle: "snapchat_handle",
	},
	youtube: {
		icon: "IconBrandYoutube",
		prefix: "https://youtube.com/@",
		handle: "youtube_handle",
	},
	website: {
		icon: "IconWorld",
		prefix: "https://",
		handle: "website",
	},
};

export const DEFAULT_SOCIAL_MEDIA_VALUES: SocialMediaFormData = {
	instagram: "",
	facebook: "",
	x: "",
	tiktok: "",
	snapchat: "",
	youtube: "",
	website: "",
};

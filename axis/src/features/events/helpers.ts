import { format } from "date-fns";
import { ar } from "date-fns/locale/ar";

export const formatArabicDateTime = (
	dateObject: Date,
): { date: string; time: string } => {
	try {
		const arabicDate: string = format(dateObject, "d MMMM yyyy", {
			locale: ar,
		});
		const formattedTime: string = format(dateObject, "HH:mm");

		return {
			date: arabicDate,
			time: formattedTime,
		};
	} catch (error) {
		console.error(
			"Error formatting date:",
			error instanceof Error ? error.message : "Unknown error",
		);
		return {
			date: "",
			time: "",
		};
	}
};

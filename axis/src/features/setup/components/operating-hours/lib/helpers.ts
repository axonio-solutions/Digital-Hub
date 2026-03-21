import { format } from "date-fns";
import type { CafeOperatingHour, OperatingHoursData } from "./types";
import { DAY_MAPPING } from "./types";

export function transformOperatingHoursToFormValues(
	hours: CafeOperatingHour[],
): OperatingHoursData {
	const defaultData: OperatingHoursData = {
		SUNDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		MONDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		TUESDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		WEDNESDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		THURSDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		FRIDAY: { enabled: true, timeSlots: [{ from: "09:00", to: "17:00" }] },
		SATURDAY: { enabled: false, timeSlots: [{ from: "09:00", to: "17:00" }] },
	};

	if (!hours || hours.length === 0) {
		return defaultData;
	}

	const hoursByDay: Record<number, CafeOperatingHour[]> = {};

	for (const hour of hours) {
		if (!hoursByDay[hour.day_of_week]) {
			hoursByDay[hour.day_of_week] = [];
		}
		hoursByDay[hour.day_of_week].push(hour);
	}

	const formData = { ...defaultData };

	for (let day = 0; day < 7; day++) {
		const dayHours = hoursByDay[day] || [];
		const dayKey = DAY_MAPPING[day];

		if (dayHours.length === 0) {
			continue;
		}

		const allClosed = dayHours.every((hour) => hour.is_closed);

		if (allClosed) {
			formData[dayKey] = {
				enabled: false,
				timeSlots: [{ from: "09:00", to: "17:00" }],
			};
		} else {
			const timeSlots = dayHours
				.filter((hour) => !hour.is_closed)
				.map((hour) => ({
					from: format(new Date(hour.opening_time), "HH:mm"),
					to: format(new Date(hour.closing_time), "HH:mm"),
				}));

			formData[dayKey] = {
				enabled: true,
				timeSlots:
					timeSlots.length > 0 ? timeSlots : [{ from: "09:00", to: "17:00" }],
			};
		}
	}

	return formData;
}

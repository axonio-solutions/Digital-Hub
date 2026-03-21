import { useFormContext } from "react-hook-form";

export function DynamicRegisterFormDescription() {
	const form = useFormContext();
	const role = form?.watch?.("role") || "customer";

	return role === "cafe_owner"
		? "ابدأ إدارة مقهاك للوصول إلى عشاق القهوة"
		: "انضم لاكتشاف أفضل أماكن القهوة وحفظها";
}

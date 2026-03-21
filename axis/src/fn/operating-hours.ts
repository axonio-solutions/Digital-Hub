import { auth } from "@/lib/auth";
import { ServerError } from "@/lib/error";
import { fetchCafeOperatingHours, updateHours } from "@/features/setup/components/operating-hours/lib/use-cases";
import type { OperatingHoursData } from "@/features/setup/components/operating-hours/lib/types";

/**
 * Fetches operating hours for the current cafe
 */
export async function fetchCafeOperatingHoursFn() {
  try {
    const session = await auth();
    
    if (!session?.user.cafe_id) {
      throw new ServerError({
        message: "No cafe associated with this user",
        statusCode: 404,
      });
    }
    
    return await fetchCafeOperatingHours(session.user.cafe_id);
  } catch (error) {
    console.error("Error fetching cafe operating hours:", error);
    throw error;
  }
}

/**
 * Updates operating hours for the current cafe
 */
export async function updateCafeOperatingHoursFn({
  data,
}: {
  data: OperatingHoursData;
}) {
  try {
    const session = await auth();
    
    if (!session?.user.cafe_id) {
      throw new ServerError({
        message: "No cafe associated with this user",
        statusCode: 404,
      });
    }
    
    return await updateHours(session.user.cafe_id, data);
  } catch (error) {
    console.error("Error updating cafe operating hours:", error);
    throw error;
  }
}

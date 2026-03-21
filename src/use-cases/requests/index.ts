import { insertNewRequest, fetchBuyerRequestsQuery, fetchOpenRequestsQuery, fetchAllRequestsQuery } from "@/data-access/requests";

/**
 * Axis Layer 4: Use Cases (Domain Business Logic)
 */

export async function createRequestUseCase(data: any) {
    try {
        const newRequest = await insertNewRequest(data);
        return { success: true, data: newRequest };
    } catch (error) {
        console.error("Error creating request use case:", error);
        return { success: false, error: "Failed to create request" };
    }
}

export async function getBuyerRequestsUseCase(buyerId: string) {
    try {
        const requests = await fetchBuyerRequestsQuery(buyerId);
        return { success: true, data: requests };
    } catch (error) {
        console.error("Error fetching buyer requests:", error);
        return { success: false, error: "Failed to fetch buyer requests" };
    }
}

export async function getOpenRequestsUseCase() {
    try {
        const requests = await fetchOpenRequestsQuery();
        return { success: true, data: requests };
    } catch (error) {
        console.error("Error fetching open requests:", error);
        return { success: false, error: "Failed to fetch open requests" };
    }
}

export async function getAllRequestsUseCase() {
    try {
        const requests = await fetchAllRequestsQuery();
        return { success: true, data: requests };
    } catch (error) {
        console.error("Error fetching all requests:", error);
        return { success: false, error: "Failed to fetch all requests" };
    }
}

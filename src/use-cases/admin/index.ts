import { fetchGlobalMetrics } from "@/data-access/admin";
import { fetchAllUsers } from "@/data-access/users";
import {
    fetchUserDistributionByWilaya,
    fetchBuyerMetrics,
    fetchSellerMetrics,
    fetchAdvancedSystemMetrics
} from "@/data-access/analytics";
import { createServerFn } from "@tanstack/react-start";

/**
 * Axis Layer 4: Use Cases for Admin
 */

export async function getAdminMetricsUseCase() {
    return await fetchGlobalMetrics();
}

export async function getAllUsersUseCase() {
    return await fetchAllUsers();
}

export async function getBuyerAnalyticsUseCase() {
    const metrics = await fetchBuyerMetrics();
    const distribution = await fetchUserDistributionByWilaya("buyer");
    return { metrics, distribution };
}

export async function getSellerAnalyticsUseCase() {
    const metrics = await fetchSellerMetrics();
    const distribution = await fetchUserDistributionByWilaya("seller");
    return { metrics, distribution };
}

export async function getAdvancedSystemMetricsUseCase() {
    return await fetchAdvancedSystemMetrics();
}

export const getAllUsersServerFn = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getAllUsersUseCase();
    });

export const getAdminMetricsServerFn = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getAdminMetricsUseCase();
    });

export const getBuyerAnalyticsServerFn = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getBuyerAnalyticsUseCase();
    });

export const getSellerAnalyticsServerFn = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getSellerAnalyticsUseCase();
    });

export const getAdvancedSystemMetricsServerFn = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getAdvancedSystemMetricsUseCase();
    });

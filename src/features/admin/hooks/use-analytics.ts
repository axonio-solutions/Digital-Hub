import { useQuery } from "@tanstack/react-query";
import { getBuyerAnalyticsServerFn, getSellerAnalyticsServerFn, getAdvancedSystemMetricsServerFn } from "@/fn/admin";

export function useBuyerAnalytics() {
    return useQuery({
        queryKey: ['admin', 'analytics', 'buyers'],
        queryFn: () => (getBuyerAnalyticsServerFn as any)(),
    });
}

export function useSellerAnalytics() {
    return useQuery({
        queryKey: ['admin', 'analytics', 'sellers'],
        queryFn: () => (getSellerAnalyticsServerFn as any)(),
    });
}

export function useSystemMetrics() {
    return useQuery({
        queryKey: ['admin', 'analytics', 'system'],
        queryFn: () => (getAdvancedSystemMetricsServerFn as any)(),
    });
}

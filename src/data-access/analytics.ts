import { db } from "@/db";
import { users, sparePartRequests, quotes } from "@/db/schema";
import { count, eq, sql, gte } from "drizzle-orm";

/**
 * Fetch geographical distribution of users by role.
 * Returns an array of { wilaya: string, count: number }
 */
export async function fetchUserDistributionByWilaya(role: "buyer" | "seller") {
    const result = await db.select({
        wilaya: users.wilaya,
        count: count()
    })
        .from(users)
        .where(eq(users.role, role))
        .groupBy(users.wilaya);

    return result.map(r => ({
        wilaya: r.wilaya || "Unknown",
        count: r.count
    }));
}

/**
 * Fetch role-specific metrics for Buyers.
 */
export async function fetchBuyerMetrics() {
    const totalBuyersResult = await db.select({ value: count() }).from(users).where(eq(users.role, 'buyer'));
    const totalRequestsResult = await db.select({ value: count() }).from(sparePartRequests);

    const totalBuyers = totalBuyersResult[0].value;
    const totalRequests = totalRequestsResult[0].value;

    // Average requests per buyer (simplified)
    const avgRequests = totalBuyers > 0
        ? (totalRequests / totalBuyers).toFixed(2)
        : "0";

    return {
        totalBuyers,
        totalRequests,
        avgRequestsPerBuyer: avgRequests
    };
}

/**
 * Fetch role-specific metrics for Sellers.
 */
export async function fetchSellerMetrics() {
    const totalSellersResult = await db.select({ value: count() }).from(users).where(eq(users.role, 'seller'));
    const totalQuotesResult = await db.select({ value: count() }).from(quotes);
    const acceptedQuotesResult = await db.select({ value: count() })
        .from(quotes)
        .where(eq(quotes.status, 'accepted'));

    const totalSellers = totalSellersResult[0].value;
    const totalQuotes = totalQuotesResult[0].value;
    const acceptedQuotes = acceptedQuotesResult[0].value;

    const conversionRate = totalQuotes > 0
        ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1)
        : "0";

    return {
        totalSellers,
        totalQuotes,
        acceptedQuotes,
        conversionRate: `${conversionRate}%`
    };
}

/**
 * Fetch advanced system metrics.
 */
export async function fetchAdvancedSystemMetrics() {
    // Registrations over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrationsQueryResult = await db.select({
        date: sql<string>`DATE(${users.createdAt})::text`,
        count: count()
    })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

    const recentRegistrations = recentRegistrationsQueryResult.map(r => ({
        date: r.date,
        count: r.count
    }));

    // We can also mock some DB metrics
    try {
        const dbStatsResult = await db.execute(sql`
            SELECT 
                pg_size_pretty(pg_database_size(current_database())) as total_size,
                (SELECT count(*) FROM pg_stat_activity) as active_connections
        `);
        const stats = dbStatsResult[0] as { total_size: string, active_connections: number };
        return {
            recentRegistrations,
            dbStats: {
                totalSize: stats.total_size,
                activeConnections: stats.active_connections
            }
        };
    } catch (e) {
        return {
            recentRegistrations,
            dbStats: { totalSize: "N/A", activeConnections: 0 }
        };
    }
}

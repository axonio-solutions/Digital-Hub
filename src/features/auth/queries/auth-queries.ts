import { getUser } from "@/fn/auth";
import { queryOptions } from "@tanstack/react-query";

/**
 * Axis Layer 2: Auth Queries
 * Using server function for both client and server (SSR)
 */
export const authQueries = {
  all: ["auth"],
  user: () =>
    queryOptions({
      queryKey: ["auth", "user"],
      queryFn: async () => {
        try {
          return await getUser();
        } catch (error) {
          console.error("failed to get user", error);
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }),
};
import type { getUser } from "@/fn/auth";
import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
		queryClient: QueryClient;
		user: Awaited<ReturnType<typeof getUser>>;
	}

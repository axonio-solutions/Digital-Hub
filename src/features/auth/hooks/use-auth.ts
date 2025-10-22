import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { authQueries } from "../queries/auth-queries"


export const useAuthSuspense = ()=>{
    return useSuspenseQuery(authQueries.user())
}

export const useAuth = ()=>{
    return useQuery(authQueries.user())
}
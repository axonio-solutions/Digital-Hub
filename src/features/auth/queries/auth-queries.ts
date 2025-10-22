import { getUser } from "@/fn/auth";
import { queryOptions } from "@tanstack/react-query";




export const authQueries = {
    all : ["auth"],
    user : ()=> queryOptions({
        queryKey : ["auth" , "user"],
        queryFn :getUser,
        staleTime : 5*60*1000,
        gcTime : 10*60 *100
    })
}
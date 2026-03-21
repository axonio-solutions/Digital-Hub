import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { loginServerFn } = await import("@/fn/auth");
            return loginServerFn({ data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        }
    });
}
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileServerFn, deactivateAccountServerFn, deleteAccountServerFn } from "@/fn/users";

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        // @ts-ignore
        mutationFn: (data: any) => updateProfileServerFn({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        }
    });
}

export function useDeactivateAccount() {
    return useMutation({
        // @ts-ignore
        mutationFn: (data: any) => deactivateAccountServerFn({ data }),
    });
}

export function useDeleteAccount() {
    return useMutation({
        // @ts-ignore
        mutationFn: (data: any) => deleteAccountServerFn({ data }),
    });
}

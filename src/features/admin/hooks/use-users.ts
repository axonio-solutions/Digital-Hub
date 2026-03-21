import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsersServerFn } from "@/fn/admin";

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    // @ts-ignore
    queryFn: () => getAllUsersServerFn(),
  });
}

export function useToggleUserBan() {
  const queryClient = useQueryClient();
  return useMutation({
    // Placeholder mutation as we haven't implemented the server fn for banning yet
    mutationFn: async (data: { userId: string, isBanned: boolean }) => {
      console.log("Toggle ban placeholder", data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

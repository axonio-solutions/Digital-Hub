import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsServerFn, markNotificationReadServerFn } from "@/fn/notifications";

export const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: string) => [...notificationKeys.all, userId] as const,
};

export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: notificationKeys.user(userId),
    // @ts-ignore
    queryFn: () => getNotificationsServerFn({ data: userId }),
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (id: string) => markNotificationReadServerFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_userId: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

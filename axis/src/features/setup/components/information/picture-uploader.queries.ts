// picture-uploader.queries.ts
import { updateCafeBannerFn } from "@/fn/picture-uploader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cafesQueries } from "./informations.queries";

export const useUpdateCafeBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { imageUrl: string }) => updateCafeBannerFn({data :input}),
    onSuccess: () => {
      queryClient.invalidateQueries(cafesQueries.details().queryKey);
    },
  });
};
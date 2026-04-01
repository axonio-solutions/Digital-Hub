// picture-uploader.queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cafesQueries } from "./informations.queries";
import { updateCafeBannerFn } from "@/fn/picture-uploader";

export const useUpdateCafeBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { imageUrl: string }) => updateCafeBannerFn({data :input}),
    onSuccess: () => {
      queryClient.invalidateQueries(cafesQueries.details().queryKey);
    },
  });
};
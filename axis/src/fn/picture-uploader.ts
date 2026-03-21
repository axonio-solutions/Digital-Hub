// picture-uploader.server.ts
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/guards/auth";
import { db } from "@/db";
import { cafes } from "@/db/schema/cafes-schema";
import { eq } from "drizzle-orm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const updateCafeBannerFn = createServerFn({
  method: "POST",
})
.middleware([authMiddleware])
.handler(async ({ context, data }) => {
  try {
    // Validate input
    

    
    const imageUrl = data.imageUrl;
    // Get authenticated cafe ID from context
    const cafeId = context.cafeId;
    if (!cafeId) throw new Error("Cafe ID required");

    // Get Supabase server client
    const supabase = getSupabaseServerClient();

    // Update database
    const [updatedCafe] = await db
      .update(cafes)
      .set({ banner_image_url: imageUrl })
      .where(eq(cafes.id, cafeId))
      .returning();

    return { 
      success: true, 
      data: {
        ...updatedCafe,
        // Get fresh URL from Supabase
        banner_image_url: supabase.storage
          .from('cafe_images')
          .getPublicUrl(updatedCafe.banner_image_url || '').data.publicUrl
      }
    };
  } catch (error) {
    console.error("Banner update failed:", error);
    throw error;
  }
});
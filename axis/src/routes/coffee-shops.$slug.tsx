import Footer from "@/components/footer";
import { Navigation } from "@/components/navbar";
import { CafeDetailsSection } from "@/features/coffee-shops/components/cafe-details-section";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/coffee-shops/$slug")({
	component: RouteComponent,
});

const CAFE_IMAGES = [
	"https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2678&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1542181961-9590d0c79dab?q=80&w=2670&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2670&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1514066558159-fc8c737ef259?q=80&w=2487&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=2487&auto=format&fit=crop",
];

function RouteComponent() {
	const slug = Route.useParams().slug;
	return (
		<>
			<Navigation />
			<div className="mx-auto pt-32 px-3 lg:max-w-6xl">
				<CafeDetailsSection
					name="كافيه إل"
					address="الرياض، منطقة الرياض"
					cafe_images={CAFE_IMAGES}
				/>
			</div>
			<Footer className="pt-16 @sm:pt-24" />
		</>
	);
}

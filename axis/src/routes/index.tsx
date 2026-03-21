import Footer from "@/components/footer";
import { AboutSection } from "@/components/marketing/about";
import { CTASection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features";
import { HeroScroll } from "@/components/marketing/hero";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { Navigation } from "@/components/navbar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<>
			<Navigation />
			<HeroScroll />
			<AboutSection />
			<FeaturesSection />
			<TestimonialsSection />
			<FaqSection />
			<CTASection />
			<Footer />
		</>
	);
}

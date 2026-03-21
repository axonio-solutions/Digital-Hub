import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
} from "@/components/ui/carousel";
import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Section from "@/features/spaces/components/section";
import { useState } from "react";
import { GalleryUploader } from "./gallery-uploader";

const mockGalleryImages = [
	{
		id: "1",
		image_url:
			"https://images.unsplash.com/photo-1542181961-9590d0c79dab?q=80&w=1000",
	},
	{
		id: "2",
		image_url:
			"https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000",
	},
	{
		id: "3",
		image_url:
			"https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1000",
	},
	{
		id: "4",
		image_url:
			"https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000",
	},
];

const mockMenuImages = [
	{
		id: "m1",
		image_url:
			"https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000",
	},
	{
		id: "m2",
		image_url:
			"https://images.unsplash.com/photo-1533640924469-f04e06f8898d?q=80&w=1000",
	},
	{
		id: "m3",
		image_url:
			"https://images.unsplash.com/photo-1623334044303-241021148842?q=80&w=1000",
	},
];

export const GalleryTabContent = () => {
	const [galleryTab, setGalleryTab] = useState("gallery-view");
	const [menuTab, setMenuTab] = useState("menu-view");
	const isRTL = true;

	const handleGalleryUploadComplete = (uploadedFiles) => {
		console.log("Gallery upload complete:", uploadedFiles);
		setGalleryTab("gallery-view");
	};

	const handleMenuUploadComplete = (uploadedFiles) => {
		console.log("Menu upload complete:", uploadedFiles);
		setMenuTab("menu-view");
	};

	return (
		<TabsContent
			value="gallery-view"
			className="flex flex-col px-4 lg:px-6 space-y-8"
		>
			{/* Cafe Gallery Section */}
			<Section
				title="معرض الصور"
				description="أضف صوراً جذابة وعالية الجودة لمقهاك لتعزيز حجوزاتك على المنصة. الصور الاحترافية تساعد في إظهار أجواء المقهى وتجذب المزيد من العملاء المحتملين"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<Tabs
						value={galleryTab}
						onValueChange={setGalleryTab}
						dir="rtl"
						className="w-full"
					>
						<TabsList className="mb-4">
							<TabsTrigger value="gallery-view">المعرض</TabsTrigger>
							<TabsTrigger value="gallery-upload">إدارة الصور</TabsTrigger>
						</TabsList>
						{galleryTab === "gallery-view" ? (
							<div className="flex flex-col gap-4">
								{mockGalleryImages.length > 0 ? (
									<div className="relative w-full max-w-4xl mx-auto">
										<Carousel
											opts={{
												direction: isRTL ? "rtl" : "ltr",
												loop: false,
												align: "start",
											}}
										>
											<CarouselContent>
												{mockGalleryImages.map((image, index) => (
													<CarouselItem key={image.id}>
														<Card className="p-0">
															<CardContent className="flex aspect-[16/9] items-center justify-center p-0 relative">
																<img
																	src={image.image_url}
																	alt={`صورة المقهى ${index + 1}`}
																	className="absolute inset-0 w-full h-full object-cover rounded-lg"
																/>
																<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
																	{`${index + 1} / ${mockGalleryImages.length}`}
																</div>
															</CardContent>
														</Card>
													</CarouselItem>
												))}
											</CarouselContent>
											<CarouselDots dir="rtl" />
										</Carousel>
									</div>
								) : (
									<div className="aspect-video flex items-center justify-center w-full flex-1 rounded-lg border border-dashed">
										<p className="text-sm text-muted-foreground">
											لا توجد صور متاحة
										</p>
									</div>
								)}
							</div>
						) : (
							<GalleryUploader
								initialImages={mockGalleryImages}
								onUploadComplete={handleGalleryUploadComplete}
								title="صور المقهى"
								maxFiles={10}
								maxSizeMB={5}
							/>
						)}
					</Tabs>
				</div>
			</Section>

			{/* Menu Photos Section */}
			<Section
				title="قائمة الطعام"
				description="اعرض قائمة الطعام الخاصة بمطعمك مع صور جذابة لكل طبق ووصف مفصل يثير شهية العملاء"
			>
				<div className="w-full flex-1 rounded-lg border p-6">
					<Tabs
						value={menuTab}
						onValueChange={setMenuTab}
						dir="rtl"
						className="w-full"
					>
						<TabsList className="mb-4">
							<TabsTrigger value="menu-view">القائمة</TabsTrigger>
							<TabsTrigger value="menu-upload">إدارة الصور</TabsTrigger>
						</TabsList>

						{menuTab === "menu-view" ? (
							<div className="flex flex-col gap-4">
								{mockMenuImages.length > 0 ? (
									<div className="relative w-full max-w-4xl mx-auto">
										<Carousel
											opts={{
												direction: isRTL ? "rtl" : "ltr",
												loop: false,
												align: "start",
											}}
										>
											<CarouselContent>
												{mockMenuImages.map((image, index) => (
													<CarouselItem key={image.id}>
														<Card className="p-0">
															<CardContent className="flex aspect-[16/9] items-center justify-center p-0 relative">
																<img
																	src={image.image_url}
																	alt={`صورة القائمة ${index + 1}`}
																	className="absolute inset-0 w-full h-full object-cover rounded-lg"
																/>
																<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
																	{`${index + 1} / ${mockMenuImages.length}`}
																</div>
															</CardContent>
														</Card>
													</CarouselItem>
												))}
											</CarouselContent>
											<CarouselDots dir="rtl" />
										</Carousel>
									</div>
								) : (
									<div className="aspect-video flex items-center justify-center w-full flex-1 rounded-lg border border-dashed">
										<p className="text-sm text-muted-foreground">
											لا توجد عناصر حالياً
										</p>
									</div>
								)}
							</div>
						) : (
							<GalleryUploader
								initialImages={mockMenuImages}
								onUploadComplete={handleMenuUploadComplete}
								title="صور القائمة"
								maxFiles={6}
								maxSizeMB={5}
							/>
						)}
					</Tabs>
				</div>
			</Section>
		</TabsContent>
	);
};

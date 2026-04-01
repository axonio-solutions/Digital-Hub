import "yet-another-react-lightbox/styles.css";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { Button } from "@/components/ui/button";

export default function CafeGallery({
	cafe_images,
}: {
	cafe_images: Array<string> | undefined;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const hasMultipleImages = (cafe_images?.length || 0) > 1;
	const showViewAllButton = (cafe_images?.length || 0) > 4;

	const openLightbox = (index: number) => {
		setSelectedIndex(index);
		setIsOpen(true);
	};

	// Handle desktop layout based on number of images
	const getDesktopLayout = () => {
		if (!cafe_images || cafe_images.length === 0) {
			return <p>No images available</p>;
		}

		if (cafe_images.length === 1) {
			return (
				<div className="h-80 rounded-xl overflow-hidden relative">
					<img
						src={cafe_images[0]}
						alt="Cafe picture"
						className="w-full h-full object-cover absolute inset-0"
						onClick={() => openLightbox(0)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(0);
							}
						}}
						aria-label="Open first image in gallery"
					/>
				</div>
			);
		}

		if (cafe_images.length === 2) {
			return (
				<div className="grid grid-cols-2 gap-2 h-80">
					<div
						className="relative h-full rounded-xl overflow-hidden cursor-pointer"
						onClick={() => openLightbox(0)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(0);
							}
						}}
						aria-label="Open first image in gallery"
					>
						<img
							src={cafe_images[0]}
							alt="Cafe photo 1"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
					<div
						className="relative h-full rounded-xl overflow-hidden cursor-pointer"
						onClick={() => openLightbox(1)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(1);
							}
						}}
						aria-label="Open second image in gallery"
					>
						<img
							src={cafe_images[1]}
							alt="Cafe photo 2"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
				</div>
			);
		}

		if (cafe_images.length === 3) {
			return (
				<div className="grid grid-cols-2 grid-rows-2 gap-2 h-80">
					<div
						className="relative row-span-2 rounded-xl overflow-hidden cursor-pointer"
						onClick={() => openLightbox(0)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(0);
							}
						}}
						aria-label="Open first image in gallery"
					>
						<img
							src={cafe_images[0]}
							alt="Cafe main photo"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
					<div
						className="relative rounded-xl overflow-hidden cursor-pointer"
						onClick={() => openLightbox(1)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(1);
							}
						}}
						aria-label="Open second image in gallery"
					>
						<img
							src={cafe_images[1]}
							alt="Cafe photo 2"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
					<div
						className="relative rounded-xl overflow-hidden cursor-pointer"
						onClick={() => openLightbox(2)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(2);
							}
						}}
						aria-label="Open third image in gallery"
					>
						<img
							src={cafe_images[2]}
							alt="Cafe photo 3"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
				</div>
			);
		}

		// 4 or more images - use a 3 column layout as shown in the image
		return (
			<div className="grid md:grid-cols-[3fr_2fr] lg:grid-cols-[2fr_3fr_2fr] gap-2 h-96">
				{/* start column */}
				<div
					className="relative h-full overflow-hidden rounded-xl cursor-pointer"
					onClick={() => openLightbox(0)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							openLightbox(0);
						}
					}}
					aria-label="Open first image in gallery"
				>
					<img
						src={cafe_images[0]}
						alt="Featured Image"
						className="w-full h-full object-cover absolute inset-0"
					/>
				</div>

				{/* Middle column */}
				<div
					className="relative h-full overflow-hidden rounded-xl cursor-pointer hidden lg:block"
					onClick={() => openLightbox(1)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							openLightbox(1);
						}
					}}
					aria-label="Open second image in gallery"
				>
					<img
						src={cafe_images[1]}
						alt="Secondary Featured Image"
						className="w-full h-full object-cover absolute inset-0"
					/>
				</div>

				{/* end column (2 images stacked) */}
				<div className="grid md:grid-rows-2 gap-2 h-full">
					<div
						className="relative h-full overflow-hidden rounded-xl cursor-pointer"
						onClick={() => openLightbox(2)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(2);
							}
						}}
						aria-label="Open third image in gallery"
					>
						<img
							src={cafe_images[2]}
							alt="Third Featured Image"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
					<div
						className="relative h-full overflow-hidden rounded-xl cursor-pointer"
						onClick={() => openLightbox(3)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								openLightbox(3);
							}
						}}
						aria-label="Open fourth image in gallery"
					>
						<img
							src={cafe_images[3]}
							alt="Fourth Featured Image"
							className="w-full h-full object-cover absolute inset-0"
						/>
					</div>
				</div>
			</div>
		);
	};

	const slides =
		cafe_images?.map((image_url) => ({
			src: image_url,
		})) || [];

	return (
		<>
			{/* Desktop Gallery */}
			<div className="hidden md:block">
				<div className="relative">
					{getDesktopLayout()}
					{showViewAllButton && (
						<Button
							onClick={() => setIsOpen(true)}
							className="absolute bottom-4 left-2 bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full shadow-lg hover:bg-white transition-colors"
						>
							View All Photos ({cafe_images?.length || 0})
						</Button>
					)}
				</div>
			</div>

			{/* Mobile Gallery */}
			<div className="md:hidden w-full">
				<div className="relative h-64 w-full mb-4 rounded-xl overflow-hidden">
					<img
						src={cafe_images?.[selectedIndex] || ""}
						alt={`Cafe picture ${selectedIndex + 1}`}
						className="w-full h-full object-cover absolute inset-0"
						onClick={() => hasMultipleImages && openLightbox(selectedIndex)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								hasMultipleImages && openLightbox(selectedIndex);
							}
						}}
						aria-label="Open image in gallery"
					/>
				</div>
				{hasMultipleImages && (
					<div className="flex gap-2 overflow-x-auto px-1 py-2 no-scrollbar">
						{cafe_images?.map((image_url, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								className={`relative h-20 w-20 min-w-[80px] rounded-xl overflow-hidden cursor-pointer transition-all ${
									index === selectedIndex ? "ring-2 ring-primary" : "opacity-75"
								}`}
								onClick={() => setSelectedIndex(index)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										setSelectedIndex(index);
									}
								}}
								aria-label="Select image in gallery"
							>
								<img
									src={image_url}
									alt={`Cafe thumbnail ${index + 1}`}
									className="w-full h-full object-cover absolute inset-0"
								/>
								{index !== selectedIndex && (
									<div className="absolute inset-0 bg-black/40" />
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Lightbox Modal */}
			<Lightbox
				open={isOpen}
				close={() => setIsOpen(false)}
				slides={slides}
				index={selectedIndex}
			/>
		</>
	);
}

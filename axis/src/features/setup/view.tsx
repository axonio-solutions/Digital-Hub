import {
	IconAt,
	IconBrandTinder,
	IconClick,
	IconFileText,
	IconLibraryPhoto,
} from "@tabler/icons-react";

import { useState } from "react";
import { AmenitiesTabContent } from "./components/amenities/amenities";
import { ContactTabContent } from "./components/cafe-contact-information/contact";
import { SocialTabContent } from "./components/cafe-social-media/cafe-social-media";
import { GalleryTabContent } from "./components/gallery";
import { InformationTabContent } from "./components/information/information";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const SetupView = () => {
  const [selectedView, setSelectedView] = useState("information");
	return (
		<div className="container mx-auto px-4 space-y-4">
			<div className="space-y-0.5 px-4 lg:px-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
					إعدادات المقهى
				</h1>
				<p className="text-xs sm:text-sm text-muted-foreground">
					قم بتحديث معلومات المقهى وإدارته على المنصة
				</p>
			</div>

			<Tabs
				dir="rtl"
				value={selectedView}
				onValueChange={setSelectedView}
				className="w-full flex-col justify-start gap-6"
			>
				<div className="flex items-center justify-between px-4 lg:px-6">
					<Label htmlFor="view-selector" className="sr-only">
						عرض
					</Label>
					<Select
						dir="rtl"
						value={selectedView}
						onValueChange={setSelectedView}
					>
						<SelectTrigger
							className="flex w-fit @4xl/main:hidden"
							size="sm"
							id="view-selector"
						>
							<SelectValue placeholder="اختر العرض" />
						</SelectTrigger>
						<SelectContent className="[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
							<SelectItem value="information">
								<IconFileText className="size-3.5 sm:size-4" />
								<span>المعلومات الأساسية</span>
							</SelectItem>
							<SelectItem value="amenities">
								<IconBrandTinder className="size-3.5 sm:size-4" />
								<span>المرافق</span>
							</SelectItem>
							<SelectItem value="gallery-view">
								<IconLibraryPhoto className="size-3.5 sm:size-4" />
								<span>معرض الصور</span>
							</SelectItem>
							<SelectItem value="contact">
								<IconAt className="size-3.5 sm:size-4" />
								<span>معلومات الاتصال</span>
							</SelectItem>
							<SelectItem value="social">
								<IconClick className="size-3.5 sm:size-4" />
								<span>وسائل التواصل</span>
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList
						dir="rtl"
						className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
					>
						<TabsTrigger
							value="information"
							role="tab"
							aria-selected={false}
							aria-controls="packages-content"
						>
							<IconFileText className="size-3.5 sm:size-4" />
							<span>المعلومات الأساسية</span>
						</TabsTrigger>
						<TabsTrigger
							value="amenities"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconBrandTinder className="size-3.5 sm:size-4" />
							<span>المرافق</span>
						</TabsTrigger>
						<TabsTrigger
							value="gallery-view"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconLibraryPhoto className="size-3.5 sm:size-4" />
							<span>معرض الصور</span>
						</TabsTrigger>
						<TabsTrigger
							value="contact"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconAt className="size-3.5 sm:size-4" />
							<span>معلومات الاتصال</span>
						</TabsTrigger>
						<TabsTrigger
							value="social"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconClick className="size-3.5 sm:size-4" />
							<span>وسائل التواصل</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* information Tab Content */}
				<InformationTabContent />

				{/* Amenities Tab Content */}
				<AmenitiesTabContent />

				{/* Gallery Tab Content */}
				<GalleryTabContent />

				{/* Contact Tab Content */}
				<ContactTabContent />

				{/* Social Tab Content */}
				<SocialTabContent />
			</Tabs>
		</div>
	);
};

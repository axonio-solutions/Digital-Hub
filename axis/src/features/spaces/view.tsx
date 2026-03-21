import { IconBuildingCommunity, IconSettings } from "@tabler/icons-react";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AreaManagementForm } from "./components/seating-areas/seating-areas";
import { SpaceSettings } from "./components/seating-settings/seating-settings";
import Section from "./components/section";

export const SpacesView = () => {
  const [selectedView, setSelectedView] = useState("areas");
	return (
		<div className="container mx-auto px-4 space-y-4">
			<div className="space-y-0.5 px-4 lg:px-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
					إدارة المساحات
				</h1>
				<p className="text-xs sm:text-sm text-muted-foreground">
					قم بتنظيم وإدارة مساحات الجلوس في المقهى لتوفير تجربة أفضل للعملاء.
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
							<SelectItem value="areas">
								<IconBuildingCommunity className="size-3.5 sm:size-4" />
								<span>المناطق</span>
							</SelectItem>
							<SelectItem value="settings">
								<IconSettings className="size-3.5 sm:size-4" />
								<span>الإعدادات</span>
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList
						dir="rtl"
						className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
					>
						<TabsTrigger
							value="areas"
							role="tab"
							aria-selected={false}
							aria-controls="packages-content"
						>
							<IconBuildingCommunity className="size-3.5 sm:size-4" />
							<span>المناطق</span>
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconSettings className="size-3.5 sm:size-4" />
							<span>الإعدادات</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Areas Tab Content */}
				<TabsContent
					value="areas"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<Section
						title="مناطق الجلوس"
						description="قم بإنشاء وإدارة مناطق الجلوس المختلفة في مقهاك، مثل المنطقة الداخلية والخارجية والمناطق الهادئة. تساعد هذه التقسيمات في تنظيم المساحة وتلبية تفضيلات العملاء المختلفة"
					>
						<div className="w-full flex-1 rounded-lg border p-6">
							<AreaManagementForm />
						</div>
					</Section>
				</TabsContent>

				{/* Settings Tab Content */}
				<TabsContent value="settings" className="flex flex-col px-4 lg:px-6">
					<SpaceSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
};

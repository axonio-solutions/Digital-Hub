import { IconPackages, IconRosetteDiscount } from "@tabler/icons-react";

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
import { PackageTable } from "./components/packages-table";

export const PackagesView = () => {
	const [selectedView, setSelectedView] = useState("packages");
	return (
		<div className="container mx-auto px-4 space-y-4">
			<div className="space-y-0.5 px-4 lg:px-6">
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
					الباكيجات والعروض
				</h1>
				<p className="text-xs sm:text-sm text-muted-foreground">
					إدارة الباكيجات والعروض الخاصة بالمقهى
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
							<SelectItem value="packages">
								<IconPackages className="size-3.5 sm:size-4" />
								<span>الباكيجات</span>
							</SelectItem>
							<SelectItem disabled value="offers">
								<IconRosetteDiscount className="size-3.5 sm:size-4" />
								<span>العروض</span>
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList
						dir="rtl"
						className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
					>
						<TabsTrigger
							value="packages"
							role="tab"
							aria-selected={false}
							aria-controls="packages-content"
						>
							<IconPackages className="size-3.5 sm:size-4" />
							<span>الباكيجات</span>
						</TabsTrigger>
						<TabsTrigger
							disabled
							value="offers"
							role="tab"
							aria-selected={false}
							aria-controls="offers-content"
						>
							<IconRosetteDiscount className="size-3.5 sm:size-4" />
							<span>العروض</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Packages Tab Content */}
				<TabsContent
					value="packages"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<PackageTable />
				</TabsContent>

				{/* Offers Tab Content (Disabled) */}
				<TabsContent value="offers" className="flex flex-col px-4 lg:px-6">
					<div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
				</TabsContent>
			</Tabs>
		</div>
	);
};

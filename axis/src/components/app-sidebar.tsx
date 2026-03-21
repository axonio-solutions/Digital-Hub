import {
	IconCalendarBolt,
	IconCategory2,
	IconChartPie2,
	IconConfetti,
	IconDoor,
	IconInnerShadowTop,
	IconTicket,
} from "@tabler/icons-react";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthSuspense } from "@/features/auth/hooks/use-auth";

const cafeOwnerNavItems = [
	{
		title: "إحصائيات المقهى",
		url: "/dashboard",
		icon: IconChartPie2,
	},
	{
		title: "إدارة المقهى",
		url: "/dashboard/management/setup",
		icon: IconCategory2,
	},
	{
		title: "إدارة المساحات",
		url: "/dashboard/management/spaces",
		icon: IconDoor,
	},
	{
		title: "إدارة الفعاليات",
		url: "/dashboard/management/events",
		icon: IconConfetti,
	},
	{
		title: "إدارة الحجوزات",
		url: "/dashboard/management/reservations",
		icon: IconCalendarBolt,
	},
	{
		title: "إدارة الباكيجات و العروض",
		url: "/dashboard/management/packages",
		icon: IconTicket,
	},
];

const customerNavItems = [
	{
		title: "استكشاف المقاهي",
		url: "#",
		icon: IconCategory2,
	},
	{
		title: "حجوزاتي",
		url: "#",
		icon: IconCalendarBolt,
	},
	{
		title: "الفعاليات",
		url: "#",
		icon: IconConfetti,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useAuthSuspense();
		const isCafeOwner = user?.user_type === "cafe_owner";

		const mainNavItems = isCafeOwner ? cafeOwnerNavItems : customerNavItems;
		return (
			<Sidebar collapsible="offcanvas" side="right" {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="data-[slot=sidebar-menu-button]:!p-1.5"
							>
								<a href="/dashboard">
									<IconInnerShadowTop className="!size-5" />
									<span className="text-base font-semibold">Axis Platform</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<NavMain isCafeOwner={isCafeOwner} items={mainNavItems} />
				</SidebarContent>
				<SidebarFooter>
					<NavUser />
				</SidebarFooter>
			</Sidebar>
		);
}

"use client"

import {  type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  type sidebarMenuButtonVariants,
} from "@/components/ui/sidebar"
import { TooltipContent } from "@/components/ui/tooltip"
import { VariantProps } from "class-variance-authority"
import { createLink } from "@tanstack/react-router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {

  const CustomSidebarMenuButton = (
			props: React.ComponentProps<"button"> & {
				asChild?: boolean;
				isActive?: boolean;
				tooltip?: string | React.ComponentProps<typeof TooltipContent>;
			} & VariantProps<typeof sidebarMenuButtonVariants>,
		) => <SidebarMenuButton {...props} />;
		const CustomLink = createLink(CustomSidebarMenuButton);
		const { setOpenMobile, isMobile } = useSidebar();

		const handleLinkClick = () => {
			if (isMobile) {
				setOpenMobile(false);
			}
		};
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        
        <SidebarMenu>


           {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <CustomLink
									to={item.url}
									onClick={handleLinkClick}
									tooltip={item.title}
									activeProps={{
										className: "bg-secondary border",
									}}
									className="cursor-pointer"
									activeOptions={{ exact: true }}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
              </CustomLink>
            </SidebarMenuItem>
          ))}
          
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

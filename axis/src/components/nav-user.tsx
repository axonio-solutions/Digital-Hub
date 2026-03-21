import {
	IconCreditCard,
	IconDotsVertical,
	IconLoader,
	IconLogout,
	IconNotification,
	IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { AUTH_ROUTES } from "@/features/auth/constants/config";
import { useAuthSuspense } from "@/features/auth/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

const getInitials = (name: string) => {
	if (!name) return "";
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
};

export function NavUser() {
  const router = useRouter();
	const { isMobile } = useSidebar();
	const { data: user } = useAuthSuspense();
  const [isLogout, setIsLogout] = useState(false);

  if (!user) {
		return null;
	}

	const userInitials = getInitials(user.name || "");

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu dir="rtl">
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg grayscale">
								<AvatarImage src={user.image || ""} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-start text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="text-muted-foreground truncate text-xs">
									{user?.email}
								</span>
							</div>
							<IconDotsVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image || ""} alt={user.name} />
									<AvatarFallback className="rounded-lg">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-start text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="text-muted-foreground truncate text-xs">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild className="cursor-pointer">
								<Link to="/dashboard/settings">
									<IconUserCircle />
									إعدادات الحساب
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem disabled className="cursor-pointer">
								<IconCreditCard />
								الدفع و الفواتير
							</DropdownMenuItem>
							<DropdownMenuItem disabled className="cursor-pointer">
								<IconNotification />
								الإشعارات
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer"
							variant="destructive"
							onClick={async () => {
								await authClient.signOut({
									fetchOptions: {
										onSuccess: () => {
											router.navigate({ to: AUTH_ROUTES.LOGIN });
										},
										onRequest() {
											setIsLogout(true);
										},
									},
								});
							}}
						>
							{isLogout ? (
								<IconLoader className="animate-spin" />
							) : (
								<IconLogout />
							)}
							تسجيل الخروج
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

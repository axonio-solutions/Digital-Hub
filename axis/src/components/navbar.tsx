import { Link } from "@tanstack/react-router";
import { Globe, Menu, X } from "lucide-react";
import React from "react";
import { PlatformLogo } from "../../public/platform-logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import useScroll from "@/hooks/use-scroll";
import { AUTH_ROUTES } from "@/features/auth/constants/config";

export function Navigation() {
	const scrolled = useScroll(15);
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)");
		const handleMediaQueryChange = () => {
			setOpen(false);
		};

		mediaQuery.addEventListener("change", handleMediaQueryChange);
		handleMediaQueryChange();

		return () => {
			mediaQuery.removeEventListener("change", handleMediaQueryChange);
		};
	}, []);

	return (
		<header
			dir="rtl"
			className={cn(
				"fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
				open ? "h-52" : "h-16",
				scrolled || open
					? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl"
					: "bg-white/0 dark:bg-gray-950/0",
			)}
		>
			<div className="w-full md:my-auto">
				<div className="relative flex items-center justify-between">
					<Link to="/" aria-label="Home">
						<span className="sr-only">Axis logo</span>
						<PlatformLogo className="w-28 md:w-32" />
					</Link>

					<nav className="hidden md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
						<div className="flex items-center gap-10 font-medium">
							<a
								className="px-2 py-1 text-gray-900 dark:text-gray-50"
								href="#features"
							>
								المميزات
							</a>
							<a
								className="px-2 py-1 text-gray-900 dark:text-gray-50"
								href="#pricing"
							>
								الأسعار
							</a>
							<a
								className="px-2 py-1 text-gray-900 dark:text-gray-50"
								href="#offers"
							>
								العروض
							</a>
						</div>
					</nav>

					<div className="hidden items-center gap-4 md:flex">
						<Button variant="ghost" className="cursor-pointer">
							اللغة
							<Globe className="h-4 w-4" />
						</Button>
						<Button asChild>
							<Link to={AUTH_ROUTES.LOGIN}>تسجيل الدخول</Link>
						</Button>
					</div>

					<div className="flex gap-x-2 md:hidden">
						<Button
							onClick={() => setOpen(!open)}
							variant="secondary"
							className="aspect-square p-2"
						>
							{open ? (
								<X aria-hidden="true" className="size-5" />
							) : (
								<Menu aria-hidden="true" className="size-5" />
							)}
						</Button>
						<Button asChild>
							<Link to={AUTH_ROUTES.LOGIN}>تسجيل الدخول</Link>
						</Button>
					</div>
				</div>

				<nav
					className={cn(
						"my-6 text-lg ease-in-out will-change-transform md:hidden",
						open ? "" : "hidden",
					)}
				>
					<ul className="space-y-4 font-medium text-right">
						<li onClick={() => setOpen(false)}>
							<a href="#features">المميزات</a>
						</li>
						<li onClick={() => setOpen(false)}>
							<a href="#pricing">الأسعار</a>
						</li>
						<li onClick={() => setOpen(false)}>
							<a href="#offers">العروض</a>
						</li>
					</ul>

					<div className="mt-4 space-y-4">
						<Button asChild>
							<Link to="/login">تسجيل الدخول</Link>
						</Button>
						<Button
							variant="secondary"
							className="flex items-center justify-center gap-2"
						>
							اللغة
							<Globe className="h-4 w-4" />
						</Button>
					</div>
				</nav>
			</div>
		</header>
	);
}

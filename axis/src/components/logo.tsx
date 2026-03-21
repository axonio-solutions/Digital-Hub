import { Link } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

export function Logo() {
	return (
		<Link to="/" className="flex items-center gap-2 self-center font-medium">
			<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<GalleryVerticalEnd className="size-4" />
			</div>
			Axis
		</Link>
	);
}

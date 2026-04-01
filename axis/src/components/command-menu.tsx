import {  IconSearch } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./ui/command";
import type {Icon} from "@tabler/icons-react";

// Icon components
const SearchIcon = () => <IconSearch size={16} />;

// useOnClickOutside hook implementation
const useOnClickOutside = (
	ref,
	handler,
	eventType = "mousedown",
	eventListenerOptions = { passive: true },
) => {
	useEffect(() => {
		const listener = (event) => {
			// Do nothing if clicking ref's element or descendent elements
			if (!ref.current || ref.current.contains(event.target)) {
				return;
			}

			handler(event);
		};

		document.addEventListener(eventType, listener, eventListenerOptions);

		return () => {
			document.removeEventListener(eventType, listener, eventListenerOptions);
		};
	}, [ref, handler, eventType, eventListenerOptions]);
};

interface CommandMenuItem {
	title: string;
	url: string;
	icon?: Icon;
}

interface CommandMenuProps {
	items?: Array<CommandMenuItem>;
	trigger: React.ReactNode;
}

export function CommandMenu({ items = [], trigger }: CommandMenuProps) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const commandRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close the menu
	useOnClickOutside(commandRef, () => {
		if (open) setOpen(false);
	});

	// Handle keyboard shortcuts
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		// Add the event listener immediately
		document.addEventListener("keydown", down);

		// Clean up the event listener when component unmounts
		return () => document.removeEventListener("keydown", down);
	}, []); // Empty dependency array so it runs only once on mount

	// Handle escape key separately
	useEffect(() => {
		if (!open) return; // Only add listener when command palette is open

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open]);

	// Focus the input when menu opens
	useEffect(() => {
		if (open && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
		}
	}, [open]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setOpen(false);
		}
	};

	// Handle navigation with Tanstack Router
	const handleNavigation = (url: string) => {
		navigate({ to: url });
		setOpen(false);
	};

	return (
		<>
			{/* Clone the trigger element with onClick handler */}
			{React.cloneElement(trigger as React.ReactElement, {
				onClick: (e: React.MouseEvent) => {
					e.preventDefault();
					setOpen(true);
					// Call the original onClick if it exists
					if ((trigger as React.ReactElement).props.onClick) {
						(trigger as React.ReactElement).props.onClick(e);
					}
				},
			})}

			{/* Command menu and backdrop */}
			{open && (
				<div className="fixed inset-0 z-50">
					{/* Backdrop overlay with blur effect */}
					<div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200" />

					{/* Centered command menu */}
					<div className="fixed inset-0 flex items-center justify-center">
						<div
							className="w-[500px] bg-background rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300"
							ref={commandRef}
						>
							<Command className="rounded-lg" onKeyDown={onKeyDown}>
								<CommandInput
									ref={inputRef}
									placeholder="ابحث هنا..."
									value={inputValue}
									onValueChange={setInputValue}
									autoFocus
								/>
								<CommandList>
									<CommandEmpty>لا يوجد نتائج</CommandEmpty>
									<HomeCommands items={items} onNavigate={handleNavigation} />
								</CommandList>
							</Command>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

interface HomeCommandsProps {
	items: Array<CommandMenuItem>;
	onNavigate: (url: string) => void;
}

function HomeCommands({ items = [], onNavigate }: HomeCommandsProps) {
	return (
		<>
			<CommandGroup heading="Navigation">
				{items.length > 0 ? (
					items.map((item) => (
						<CommandItem key={item.title} onSelect={() => onNavigate(item.url)}>
							{item.icon && <item.icon className="h-4 w-4" />}
							<span>{item.title}</span>
						</CommandItem>
					))
				) : (
					<CommandItem>
						<SearchIcon />
						<span>بحث...</span>
					</CommandItem>
				)}
			</CommandGroup>
		</>
	);
}

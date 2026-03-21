import { createContext, useContext, useState } from "react";

interface RegistrationContextValue {
	isSuccess: boolean;
	setSuccess: (value: boolean) => void;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(
	null,
);

export function RegistrationProvider({
	children,
}: { children: React.ReactNode }) {
	const [isSuccess, setSuccess] = useState(false);

	return (
		<RegistrationContext.Provider value={{ isSuccess, setSuccess }}>
			{children}
		</RegistrationContext.Provider>
	);
}

export function useRegistrationContext() {
	const context = useContext(RegistrationContext);
	if (!context) {
		throw new Error(
			"useRegistrationContext must be used within RegistrationProvider",
		);
	}
	return context;
}

import { Link } from "@tanstack/react-router";
import { AUTH_ROUTES } from "../constants/config";

interface AuthFooterProps {
	variant: "terms" | "login" | "register";
}

export function AuthFooter({ variant }: AuthFooterProps) {
	const variants = {
		terms: () => (
			<>
				بالاستمرار، أنت توافق على{" "}
				<Link to="/terms" className="text-primary">
					شروط الخدمة
				</Link>{" "}
				و{" "}
				<Link to="/privacy" className="text-primary">
					سياسة الخصوصية
				</Link>
			</>
		),
		login: () => (
			<>
				ليس لديك حساب؟{" "}
				<Link to={AUTH_ROUTES.REGISTER} className="text-primary">
					تسجيل
				</Link>
			</>
		),
		register: () => (
			<>
				لديك حساب بالفعل؟{" "}
				<Link to={AUTH_ROUTES.LOGIN} className="text-primary">
					سجل الدخول
				</Link>
			</>
		),
	};

	return (
		<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
			{variants[variant]()}
		</div>
	);
}

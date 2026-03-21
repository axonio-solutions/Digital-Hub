import { AnimatePresence, motion } from "motion/react";

export function RegistrationSuccess() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
			<AnimatePresence mode="wait">
				<motion.div
					key="success"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="text-center"
				>
					<h1 className="text-4xl max-w-lg mx-auto font-semibold tracking-tight mb-4">
						تفضل بفحص صندوق الوارد الخاص بك
					</h1>
					<p className="text-base max-w-md mx-auto">
						لقد أرسلنا لك رابط تحقق عبر البريد الإلكتروني. يرجى الضغط على الرابط
						لإكمال التسجيل.
					</p>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

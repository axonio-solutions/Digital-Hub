const faqs = [
	{
		question: "كيف يساعد AXIS المطاعم والمقاهي في إدارة الحجوزات؟",
		answer:
			"AXIS يوفر نظام حجز متكامل يتيح للعملاء حجز الطاولات مسبقًا، بينما يساعد أصحاب المطاعم في تنظيم أوقات الذروة وتقليل أوقات الانتظار بفضل نظام الإدارة الذكي.",
	},
	{
		question: "هل يمكنني إدارة الفعاليات داخل المقهى أو المطعم عبر AXIS؟",
		answer:
			"نعم، يتيح AXIS إمكانية إنشاء الفعاليات وجدولة الحجوزات للفعاليات الخاصة مثل الأمسيات الموسيقية، العروض الترفيهية، وورش العمل، مما يسهل على العملاء حجز أماكنهم مسبقًا.",
	},
	{
		question: "هل يدعم AXIS الدفع الإلكتروني عند الحجز؟",
		answer:
			"نعم، يدعم AXIS وسائل الدفع الرقمية، مما يتيح للعملاء الدفع عند الحجز أو تقسيم الفاتورة بين الأصدقاء، مما يجعل التجربة أكثر مرونة وسلاسة.",
	},
	{
		question: "هل يمكنني استخدام AXIS إذا كان لدي مطعم صغير؟",
		answer:
			"بالطبع! AXIS مناسب لجميع أحجام المطاعم والمقاهي، سواء كنت تدير مقهى صغيرًا أو مطعمًا فاخرًا، حيث يساعدك في تنظيم الحجوزات وزيادة الكفاءة التشغيلية.",
	},
	{
		question: "كيف يمكنني الاستفادة من تحليلات AXIS؟",
		answer:
			"يتيح AXIS تحليلات متقدمة وتقارير مفصلة حول أداء الحجوزات، أوقات الذروة، وتفضيلات العملاء، مما يساعد أصحاب المطاعم والمقاهي على اتخاذ قرارات استراتيجية أفضل.",
	},
	{
		question: "هل يتطلب AXIS تدريبًا لاستخدامه؟",
		answer:
			"لا، تم تصميم AXIS بواجهة سهلة الاستخدام، ويمكن لأي شخص استخدامه دون الحاجة إلى تدريب معقد، كما يتوفر دعم فني عند الحاجة.",
	},
	{
		question: "هل يمكنني تجربة AXIS قبل الاشتراك؟",
		answer:
			"نعم، يمكن لأصحاب المطاعم والمقاهي الاشتراك في تجربة مجانية لاختبار المنصة والتأكد من أنها تلبي احتياجاتهم قبل الاشتراك المدفوع.",
	},
];

const FaqSection = () => {
	return (
		<section className="py-32" dir="rtl">
			<div className="container px-4 max-w-6xl mx-auto">
				<div className="text-center mb-8 md:mb-16">
					<div className="flex  justify-center items-center gap-4 text-sm font-semibold mb-4">
						<span className="flex items-center gap-2">أسئلة متكررة</span>
						<span className="flex items-center gap-2">إجابات وافية</span>
						<span className="flex items-center gap-2">دعم مباشر</span>
					</div>
					<h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
						ما هي استفسارات <span className="text-orange-500">نظام AXIS</span>؟
					</h2>
				</div>
				<div className="mx-auto mt-14 max-w-screen-sm">
					{faqs.map((faq, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={index} className="mb-8 flex gap-4">
							<span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
								{index + 1}
							</span>
							<div>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-medium">{faq.question}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{faq.answer}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export { FaqSection };

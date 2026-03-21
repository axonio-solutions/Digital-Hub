import { Testimonial } from "./testimonial-card";

const testimonials = [
	{
		content:
			"AXIS أحدث فرقًا كبيرًا في طريقة إدارة حجوزات المطعم لدينا! أصبحنا نستقبل حجوزات أكثر بكفاءة وسهولة دون أي ارتباك.",
		author: "أحمد، صاحب مطعم المذاق الفاخر",
		imgAlt: "Ahmed",
	},
	{
		content:
			"نظام الانتظار الذكي في AXIS حل أكبر مشاكلنا! الآن يمكننا إدارة طاولاتنا بشكل أكثر تنظيمًا وتقليل أوقات الانتظار للزبائن.",
		author: "سارة، مديرة مقهى لافيندر",
		imgAlt: "Sarah",
	},
	{
		content:
			"مع تحليلات AXIS المتقدمة، أصبح بإمكاننا فهم سلوك العملاء بشكل أفضل والتخطيط لعروض خاصة تزيد من ولائهم للمقهى.",
		author: "خالد، مالك مقهى فيو كافيه",
		imgAlt: "Khaled",
	},
];

function TestimonialsSection() {
	return (
		<div className="container px-4 py-10 max-w-6xl mx-auto" dir="rtl">
			<div className="text-center mb-8 md:mb-16">
				{/* On mobile, stack the header spans vertically; on md+ show them inline */}
				<div className="flex  justify-center items-center gap-4 text-sm font-semibold mb-4">
					<span className="flex items-center gap-2">تجارب حقيقية</span>
					<span className="flex items-center gap-2">آراء العملاء</span>
					<span className="flex items-center gap-2">قصص نجاح</span>
				</div>
				<h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
					ماذا يقول عملاؤنا عن{" "}
					<span className="text-orange-500">تجربة AXIS</span>
				</h2>
			</div>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{testimonials.map((testimonial, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Using index for simplicity
					<Testimonial key={index} {...testimonial} />
				))}
			</div>
		</div>
	);
}

export { TestimonialsSection };

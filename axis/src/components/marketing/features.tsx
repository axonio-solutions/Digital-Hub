import { AlarmClockIcon } from "../animated-icons/alarm-clock";
import { BadgePercentIcon } from "../animated-icons/badge-percent";
import { ChartScatterIcon } from "../animated-icons/chart-scatter";
import { CoffeeIcon } from "../animated-icons/coffee";
import { ConnectIcon } from "../animated-icons/connect";
import { FilePenLineIcon } from "../animated-icons/file-pen-line";
import { FlaskIcon } from "../animated-icons/flask";
import { PartyPopperIcon } from "../animated-icons/party-popper";
import { SparklesControlledIcon } from "../animated-icons/sparkles-controlled";
import { UpvoteIcon } from "../animated-icons/upvote";
import { WebhookIcon } from "../animated-icons/webhook";
import { FeatureCard } from "./feature-card";

export function FeaturesSection() {
	const features = [
		{
			title: "إدارة الحجوزات بذكاء",
			description:
				"تمكن المطاعم والمقاهي من إدارة الحجوزات والطاولات بمرونة، مما يساعد في تحسين استغلال المساحات وتقليل أوقات الانتظار.",
			icon: <FilePenLineIcon />,
		},
		{
			title: "تنظيم الفعاليات بسلاسة",
			description:
				"إمكانية إنشاء وإدارة الفعاليات مثل الأمسيات الموسيقية، العروض الفنية، وورش العمل مع نظام حجز متكامل للمقاعد والتذاكر.",
			icon: <PartyPopperIcon />,
		},
		{
			title: "قوائم انتظار ذكية",
			description:
				"إذا كانت الطاولات ممتلئة، يمكن للنظام تقدير وقت الانتظار وإبلاغ العملاء بإشعارات فورية عند توفر الطاولة.",
			icon: <AlarmClockIcon />,
		},
		{
			title: "طلبات مسبقة للطعام والشراب",
			description:
				"يتيح للعملاء طلب الطعام عند الحجز، مما يقلل من وقت الانتظار ويحسن تجربة الخدمة داخل المكان.",
			icon: <CoffeeIcon />,
		},
		{
			title: "برامج ولاء وعروض مخصصة",
			description:
				"دعم برامج الولاء الرقمية والعروض الحصرية لتحفيز العملاء المتكررين وزيادة ولائهم للمطعم أو المقهى.",
			icon: <BadgePercentIcon />,
		},
		{
			title: "تكامل مع وسائل الدفع الرقمية",
			description:
				"إمكانية الدفع الإلكتروني عند الحجز وتقسيم الفاتورة بين الأصدقاء مباشرة عبر المنصة.",
			icon: <ConnectIcon />,
		},
		{
			title: "تحليلات وتقارير متقدمة",
			description:
				"توفر تقارير تحليلية شاملة حول أداء الحجوزات، تفضيلات العملاء، وأوقات الذروة، مما يساعد في تحسين استراتيجيات التشغيل والتسويق.",
			icon: <ChartScatterIcon />,
		},
		{
			title: "واجهة حديثة وسهلة الاستخدام",
			description:
				"تصميم بسيط وسلس يتيح لكل من العملاء وأصحاب الأعمال إدارة الحجوزات بسهولة دون الحاجة إلى تعقيد.",
			icon: <SparklesControlledIcon />,
		},
	];

	return (
		<section className="py-16">
			<div className="text-center mb-8 md:mb-16">
				<div className="flex justify-center items-center gap-4 text-sm font-semibold mb-4 p-2">
					<span className="flex items-center gap-2">
						<UpvoteIcon /> تحسين تجربة العملاء
					</span>
					<span className="flex items-center gap-2">
						<WebhookIcon /> تكامل سلس مع الأنظمة
					</span>
					<span className="flex items-center gap-2">
						<FlaskIcon /> أدوات ذكية للتحليلات
					</span>
				</div>
				<h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
					مميزات <span className="text-orange-500">نظام AXIS</span>
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
				{features.map((feature, index) => (
					<FeatureCard key={feature.title} {...feature} index={index} />
				))}
			</div>
		</section>
	);
}

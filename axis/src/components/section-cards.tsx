import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SaudiRiyalSymbol } from "./saudi_riyal_symbol";

export function SectionCards() {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>إجمالي الأرباح</CardDescription>
					<CardTitle className="text-2xl flex gap-2 items-center font-semibold tabular-nums @[250px]/card:text-3xl">
						<span>1,250.00</span> <SaudiRiyalSymbol className="size-8" />
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						زيادة بنسبة 12.5% هذا الشهر <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">مقارنة بالشهر السابق</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>حجوزات اليوم</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						35
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingDown />
							+15%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						زيادة بنسبة 15% عن أمس <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">إجمالي 35 حجز لليوم</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>فعاليات اليوم</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						3
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						3 فعاليات مجدولة اليوم <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">مقارنة بالشهر السابق</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>العروض النشطة</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						4
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+4.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						4 عروض نشطة هذا الأسبوع <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">
						خصم 15% على المشروبات الساخنة
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

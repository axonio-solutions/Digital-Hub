import { useBuyerAnalytics } from "@/features/admin/hooks/use-analytics"
import { AlgeriaMap } from "./algeria-map"
import { Card, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, TrendingUp, ArrowUpRight, Map, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function BuyerAnalytics() {
    const { data: analytics, isLoading } = useBuyerAnalytics()

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="size-16 rounded-3xl bg-blue-500/10 flex items-center justify-center">
                    <ShoppingBag className="size-8 text-blue-500" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Buyer Intel...</p>
            </div>
        )
    }

    const metrics = [
        {
            title: "Market Demand",
            value: analytics?.metrics?.totalBuyers || 0,
            sub: "Registered Nodes",
            icon: Users,
            color: "blue"
        },
        {
            title: "Intent Volume",
            value: analytics?.metrics?.totalRequests || 0,
            sub: "Lifecycle Demands",
            icon: ShoppingBag,
            color: "indigo"
        },
        {
            title: "Engagement Rate",
            value: analytics?.metrics?.engagementRate || "0%",
            sub: "Conversion Flow",
            icon: TrendingUp,
            color: "emerald"
        }
    ]

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Buyer Intelligence</h2>
                    <p className="text-muted-foreground font-medium">Detailed demand topography and consumer analytics.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-2.5 bg-blue-600 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center gap-2">
                        <Activity className="size-3" /> Live Demands Feed
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {metrics.map((m) => (
                    <div
                        key={m.title}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={cn("size-12 rounded-xl flex items-center justify-center",
                                m.color === 'blue' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    m.color === 'indigo' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}>
                                <m.icon className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{m.value}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{m.title}</p>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">{m.sub}</span>
                                <ArrowUpRight className="size-3 text-blue-500" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <AlgeriaMap
                        data={analytics?.distribution || []}
                        role="buyer"
                        className="h-[600px]"
                    />
                </div>

                <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden p-8 flex flex-col gap-6 relative">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2 text-slate-900">
                            <Map className="size-6 text-blue-600" /> Top Wilayas
                        </CardTitle>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed">Most active consumer regions ordered by registered node volume.</p>
                    </div>

                    <div className="flex-1 space-y-3 relative z-10">
                        {analytics?.distribution?.sort((a: any, b: any) => b.count - a.count).slice(0, 6).map((item: any, idx: number) => (
                            <div key={item.wilaya} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="size-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center font-black text-xs shadow-sm">{idx + 1}</span>
                                    <span className="font-extrabold tracking-tight uppercase text-[11px] text-slate-700">{item.wilaya}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-slate-900">{item.count}</span>
                                    <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600"
                                            style={{ width: `${(item.count / analytics.distribution[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold leading-normal uppercase tracking-wider">
                        Geographic data is synchronized hourly via regional telecom identifiers.
                    </div>
                </Card>
            </div>
        </div>
    )
}

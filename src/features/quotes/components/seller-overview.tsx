import { useMemo } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"
import {
    Award,
    Clock,
    TrendingUp,
    DollarSign,
    PieChart as PieChartIcon,
    Search,
    CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useSellerQuotes } from "@/features/quotes/hooks/use-quotes"
import { useOpenRequests } from "@/features/requests/hooks/use-requests"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { NexusStatCard } from "@/components/ui/nexus-stat-card"

export function SellerOverview() {
    const { data: user } = useAuth()
    const sellerId = user?.id || ""

    const { data: myQuotes = [], isLoading: loadingQuotes } = useSellerQuotes(sellerId)
    const { data: openRequests = [], isLoading: loadingRequests } = useOpenRequests()

    // Calculate Metrics
    const stats = useMemo(() => {
        const won = myQuotes.filter((q: any) => q.status === 'accepted').length
        const pending = myQuotes.filter((q: any) => q.status === 'pending').length
        const winRate = myQuotes.length > 0 ? (won / myQuotes.length) * 100 : 0
        const totalRevenue = myQuotes
            .filter((q: any) => q.status === 'accepted')
            .reduce((acc: number, q: any) => acc + q.price, 0)

        return { won, pending, winRate, totalRevenue }
    }, [myQuotes])

    // Chart Data (Mocking daily revenue/quotes for demonstration)
    const chartData = useMemo(() => {
        return [
            { name: "Mon", revenue: 4500, quotes: 3 },
            { name: "Tue", revenue: 5200, quotes: 5 },
            { name: "Wed", revenue: 4800, quotes: 2 },
            { name: "Thu", revenue: 7100, quotes: 8 },
            { name: "Fri", revenue: 6400, quotes: 4 },
            { name: "Sat", revenue: 3200, quotes: 1 },
            { name: "Sun", revenue: 3800, quotes: 2 },
        ]
    }, [])

    if (loadingQuotes || loadingRequests) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">
                Calculating your performance metrics...
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Merchant Command</h2>
                    <p className="text-muted-foreground font-medium">Monitoring your performance metrics and marketplace reach across the MLILA grid.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="rounded-xl hover:bg-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500 border-slate-200">
                        <Link to="/dashboard/quotes">Audit Proposals</Link>
                    </Button>
                    <Button size="sm" asChild className="rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Link to="/dashboard">System Feed</Link>
                    </Button>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <NexusStatCard
                    title="Won Bids"
                    value={stats.won}
                    trend="Confirmed Deals"
                    icon={Award}
                    color="emerald"
                    isPrimary
                />
                <NexusStatCard
                    title="Pending Quotes"
                    value={stats.pending}
                    trend="Awaiting Feedback"
                    icon={Clock}
                    color="blue"
                />
                <NexusStatCard
                    title="Win Rate"
                    value={`${stats.winRate.toFixed(1)}%`}
                    trend="Conversion Ratio"
                    icon={TrendingUp}
                    color="indigo"
                />
                <NexusStatCard
                    title="Total Revenue"
                    value={`${stats.totalRevenue.toLocaleString()} DZD`}
                    trend="Lifetime Yield"
                    icon={DollarSign}
                    color="slate"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4 border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white group">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                    <TrendingUp className="size-6 text-primary" /> Revenue Velocity
                                </CardTitle>
                                <CardDescription className="font-medium text-slate-500">Earnings trajectory over 7 days.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-black text-[9px] uppercase tracking-tighter">Verified Stream</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                        formatter={(value) => [`${value} DZD`, "Revenue"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Quote Distribution */}
                <Card className="col-span-3 border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900">
                            <PieChartIcon className="size-6 text-indigo-600" /> Market Grip
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">Submission density analytics.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: "8px", border: "none" }}
                                    />
                                    <Bar dataKey="quotes" radius={[4, 4, 0, 0]}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Marketplace Activity */}
                <Card className="col-span-4 border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Search className="size-6 text-primary" /> System Broadcasts
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-500">Active demands matching your profile.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[10px] tracking-widest">{openRequests.length} Nodes Found</Badge>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="space-y-4">
                            {openRequests.slice(0, 5).map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors text-slate-400 group-hover:text-primary">
                                            <Search className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{req.partName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.vehicleBrand} • {req.modelYear}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-500">
                                        <Link to="/dashboard">Review</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Won Quote Log */}
                <Card className="col-span-3 border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <CheckCircle2 className="size-6 text-emerald-600" /> Sales Ledger
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">Recent confirmed conversions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="space-y-6">
                            {myQuotes.filter((q: any) => q.status === 'accepted').slice(0, 4).length === 0 ? (
                                <div className="py-10 text-center text-muted-foreground text-sm">
                                    <PieChartIcon className="size-8 mx-auto mb-2 opacity-20" />
                                    No recent sales recorded.
                                </div>
                            ) : (
                                myQuotes.filter((q: any) => q.status === 'accepted').slice(0, 4).map((q: any) => (
                                    <div key={q.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                                        <div className="mt-1 size-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">
                                                {q.request?.partName}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                Yield: <span className="text-emerald-600 italic">+{q.price.toLocaleString()} DZD</span>
                                            </p>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                            {new Date(q.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity,
    ClipboardList,
    CheckCircle2,
    TrendingUp,
    MessageSquare,
    ArrowRight,
    Sparkles,
    Search
} from "lucide-react";
import { Link } from "@tanstack/react-router";

// Live Hooks
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useBuyerRequests } from "@/features/requests/hooks/use-requests";
import { NexusStatCard } from "@/components/ui/nexus-stat-card";

export function BuyerOverview() {
    const { data: user } = useAuth();
    const buyerId = user?.id || "";

    // Fetch live requests to calculate metrics and recent items
    const { data: requests = [], isLoading } = useBuyerRequests(buyerId);

    // 1. Calculate Metrics
    const activeRequests = requests.filter((r: any) => r.status === 'open');
    const fulfilledRequests = requests.filter((r: any) => r.status === 'fulfilled');
    const totalQuotes = requests.reduce((acc: number, curr: any) => acc + (curr.quotes?.length || 0), 0);

    // 2. Extract Recent Items (max 3)
    const recentDemands = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

    // Extract recent quotes across all requests
    const recentQuotes = requests
        .flatMap((r: any) => (r.quotes || []).map((q: any) => ({ ...q, requestPartName: r.partName, requestId: r.id })))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    if (isLoading && buyerId) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Buyer Command</h2>
                    <p className="text-muted-foreground font-medium">Monitoring your active demands and market proposals across the MLILA grid.</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <NexusStatCard
                    title="Active Demands"
                    value={activeRequests.length}
                    trend="Awaiting Quotes"
                    icon={Activity}
                    color="blue"
                    isPrimary
                />
                <NexusStatCard
                    title="Quotes Received"
                    value={totalQuotes}
                    trend="Global Signal"
                    icon={MessageSquare}
                    color="indigo"
                />
                <NexusStatCard
                    title="Fulfillment Rate"
                    value={`${requests.length > 0 ? Math.round((fulfilledRequests.length / requests.length) * 100) : 0}%`}
                    trend="Market Yield"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <NexusStatCard
                    title="Market Reach"
                    value="Global"
                    trend="Network Load"
                    icon={TrendingUp}
                    color="slate"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
                {/* Recent Demands - 4 columns */}
                <Card className="md:col-span-4 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <ClipboardList className="size-6 text-primary" /> Recent Demands
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-500">Your latest system broadcasts.</CardDescription>
                        </div>
                        <Button size="sm" variant="ghost" asChild className="rounded-xl hover:bg-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500">
                            <Link to="/dashboard/requests" className="flex items-center gap-2">
                                Audit Data <ArrowRight className="size-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="space-y-4">
                            {recentDemands.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
                                    <Search className="size-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-sm text-muted-foreground">No requests yet.</p>
                                </div>
                            ) : (
                                recentDemands.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors">
                                                <ClipboardList className="size-6 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{req.partName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.vehicleBrand}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-black text-[10px] uppercase tracking-tighter px-3 py-1 rounded-full">
                                                {req.quotes?.length || 0} Quotes
                                            </Badge>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Quotes - 3 columns */}
                <Card className="md:col-span-3 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <MessageSquare className="size-6 text-emerald-600" /> Live Quotes
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">Market offers in trajectory.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="space-y-4">
                            {recentQuotes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <MessageSquare className="size-8 text-muted-foreground/20 mb-2" />
                                    <p className="text-xs text-muted-foreground">Waiting for quotes...</p>
                                </div>
                            ) : (
                                recentQuotes.map((quote: any) => (
                                    <div key={quote.id} className="flex flex-col space-y-2 p-5 border border-slate-100 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <p className="text-base font-black text-slate-900 tracking-tight">{quote.requestPartName}</p>
                                            <p className="text-lg font-black text-emerald-600 tracking-tighter">{quote.price.toLocaleString()} DZD</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                Node: {quote.seller?.name || "Verified Professional"}
                                            </p>
                                            <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase tracking-tighter">Verified Offer</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Announcements / Features banner */}
            <Card className="bg-slate-900 border-0 shadow-lg rounded-3xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">
                            <Sparkles className="size-8" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-white tracking-tight">System Update: Garage Auto-Sync Active</p>
                            <p className="text-sm font-medium text-slate-400">Connect your vehicle once, populate requests instantly across the grid.</p>
                        </div>
                    </div>
                    <Button size="lg" variant="outline" className="shrink-0 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest h-12 px-8">
                        Learn More
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

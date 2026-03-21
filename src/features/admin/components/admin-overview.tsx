import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Activity, Users, Box, BarChart3, ShieldAlert, Cpu, Database, TrendingUp, Zap, Globe, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts"

// Import hooks for live data
import { useOpenRequests } from "@/features/requests/hooks/use-requests"
import { useAdminMetrics } from "@/features/admin/hooks/use-admin"
import { useSystemMetrics } from "@/features/admin/hooks/use-analytics"
import { NexusStatCard } from "@/components/ui/nexus-stat-card"

export function AdminOverview() {
  const { data: metrics, isLoading: isMetricsLoading } = useAdminMetrics()
  const { data: systemMetrics, isLoading: isSystemLoading } = useSystemMetrics()
  const { data: openRequests = [] } = useOpenRequests()

  const isLoading = isMetricsLoading || isSystemLoading

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Activity className="size-12 text-primary animate-pulse" />
            <div className="absolute inset-0 size-12 bg-primary/20 blur-xl animate-pulse rounded-full" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Nexus Command...</p>
        </div>
      </div>
    )
  }

  // Calculate live numbers
  const totalUsers = metrics?.users || 0
  const totalQuotes = metrics?.quotes || 0
  const totalRequests = metrics?.requests || 0

  // Quick active load
  const currentlyOpen = openRequests.length

  // Chart Data preparation
  const registrationData = systemMetrics?.recentRegistrations || []

  return (
    <div className="flex flex-col space-y-8">
      {/* Refined Header - Consistent with Marketplace Hub */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-3">
            <Zap className="size-3 fill-slate-300 text-slate-300" /> System Status: Operational
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Nexus Analytics</h2>
          <p className="text-muted-foreground font-medium max-w-xl">
            Monitoring <span className="text-slate-900 font-bold">{totalUsers}</span> nodes and <span className="text-slate-900 font-bold">{totalRequests}</span> lifetime transactions across the Algerian automotive grid.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <Globe className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">Network Edge</p>
              <p className="text-lg font-black text-slate-900">Algeria Hub</p>
            </div>
          </div>
          <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">Security Level</p>
              <p className="text-lg font-black text-slate-900">Tier 1 Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standardized Core Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <NexusStatCard
          title="Registry Nodes"
          value={totalUsers}
          icon={Users}
          trend="+12% weekly"
          description="Total registered identifiers"
          color="blue"
        />
        <NexusStatCard
          title="Market Volume"
          value={totalRequests}
          icon={Box}
          trend="Active flow"
          description="Global part demand requests"
          color="indigo"
        />
        <NexusStatCard
          title="Active Requests"
          value={currentlyOpen}
          icon={Activity}
          trend="Immediate load"
          description="Open marketplace opportunities"
          color="rose"
          isPrimary
        />
        <NexusStatCard
          title="Nexus Quotes"
          value={totalQuotes}
          icon={BarChart3}
          trend="Converging fast"
          description="Confirmed supplier proposals"
          color="emerald"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Registration Chart - Clean Card */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white group transition-all duration-300">
          <CardHeader className="p-6 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" /> Traffic Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Daily node registrations (30-day window)</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-0">REALTIME</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-6 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="nexusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.split('-').slice(2).join('/')}
                />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border p-3 rounded-xl shadow-lg">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                          <p className="text-lg font-black text-slate-900">{payload[0].value} <span className="text-xs font-bold text-slate-500 font-normal">new users</span></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#nexusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Infrastructure Details - Clean Style */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1 border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Cpu className="size-4" />
                </div> Core Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                    <Database className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Database Size</p>
                    <p className="text-base font-bold text-slate-900 leading-none">{systemMetrics?.dbStats?.totalSize || "N/A"}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-bold text-[9px]">HEALTHY</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                    <Activity className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Active Conns</p>
                    <p className="text-base font-bold text-slate-900 leading-none">{systemMetrics?.dbStats?.activeConnections || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">
                  <div className="size-1 bg-blue-600 rounded-full" /> LIVE
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <ShieldAlert className="size-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-sm uppercase tracking-tight">Security Perimeter</h4>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed max-w-[200px] mt-1">
                Full-spectrum firewall active. No unauthorized intrusion vectors detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client";

import {
  Download,
  ChevronRight,
} from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  useAdminDashboardStats,
  useSystemMetrics,
} from "@/features/admin/hooks/use-analytics";
import { useAllRequests } from "@/features/requests/hooks/use-requests";
import { MarketplaceActivityTable, type MarketplaceActivity } from "./marketplace-activity-table";

const chartConfig = {
  visitors: {
    label: "Offers",
  },
  safari: {
    label: "Avg Offers",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AdminOverview() {
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats();
  const { data: systemMetrics, isLoading: isMetricsLoading } = useSystemMetrics();
  const { data: allRequests = [], isLoading: isRequestsLoading } = useAllRequests();

  const isLoading = isStatsLoading || isMetricsLoading || isRequestsLoading;

  if (isLoading) {
    return <AdminOverviewSkeleton />;
  }

  // Data mapping
  const totalBuyers = stats?.totalBuyers || 0;
  const totalSellers = stats?.totalSellers || 0;
  const openRequestsCount = stats?.openRequests || 0;
  const totalQuotes = stats?.totalQuotes || 0;
  const marketHealthStatus = stats?.marketHealth || 'N/A';

  // Chart Data: Request Volume
  const volData = systemMetrics?.requestVolume || [];
  const displayVol = volData.slice(-10);
  const maxVol = Math.max(...displayVol.map((d: any) => d.count), 1);

  // Chart Data: Market Health
  const marketHealth = stats || { avgOffersPerRequest: 0, marketHealth: 'N/A' };
  const healthPercent = Math.min((marketHealth.avgOffersPerRequest / 5) * 100, 100);

  // Recent Activity Data Mapping for Premium Table
  const tableData: MarketplaceActivity[] = allRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10) // Show more in the premium table
    .map(req => ({
      id: req.id,
      partName: req.partName,
      buyer: req.buyer?.name || "Guest",
      brand: req.vehicleBrand,
      year: req.modelYear,
      status: req.status,
      offers: req.quotes?.length || 0,
      createdAt: req.createdAt.toISOString(),
      image: req.imageUrls?.[0]
    }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, here's what's happening on MLILA today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Buyers */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Buyers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalBuyers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Vetted participants
            </div>
            <div className="text-muted-foreground">Total registered platform buyers</div>
          </CardFooter>
        </Card>

        {/* Live Sellers */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Live Sellers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalSellers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Verified merchants
            </div>
            <div className="text-muted-foreground">Active supply side partners</div>
          </CardFooter>
        </Card>

        {/* Open Demands */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Open Demands</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {openRequestsCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Marketplace activity
            </div>
            <div className="text-muted-foreground">Total currently open requests</div>
          </CardFooter>
        </Card>

        {/* Market Supply */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Market Supply</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalQuotes.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="gap-1">
                {marketHealthStatus}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Quotes & Offers
            </div>
            <div className="text-muted-foreground">Total availability across network</div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>
              Market demand over the last 10 nodes
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[240px] items-end gap-2 px-2">
              {displayVol.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Insufficient data for volume projection...
                </div>
              ) : (
                displayVol.map((node: any, idx: number) => {
                  const height = (node.count / maxVol) * 100;
                  const isHighlight = idx === displayVol.length - 1;
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className={cn(
                          "w-full rounded-sm transition-all",
                          isHighlight ? "bg-primary" : "bg-primary/20 hover:bg-primary/40"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
              <span>{displayVol[0]?.date || 'Start'}</span>
              <span>{displayVol[Math.floor(displayVol.length / 2)]?.date || 'Mid'}</span>
              <span>{displayVol[displayVol.length - 1]?.date || 'Today'}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Market Analytics</CardTitle>
            <CardDescription>
              Avg offers per marketplace request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
              <RadialBarChart
                data={[{ browser: "safari", visitors: marketHealth.avgOffersPerRequest, fill: "var(--color-safari)" }]}
                startAngle={0}
                endAngle={healthPercent * 3.6}
                innerRadius={60}
                outerRadius={90}
              >
                <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[66, 54]} />
                <RadialBar dataKey="visitors" background cornerRadius={5} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold tracking-tighter">
                              {marketHealth.avgOffersPerRequest.toFixed(1)}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                              Offers/Req
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-0">
            <div className="flex w-full items-center justify-between border-t py-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm font-medium">Market Health</span>
              </div>
              <span className="text-sm font-bold uppercase">{marketHealth.marketHealth}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div>
        <MarketplaceActivityTable data={tableData} />
      </div>

    </div>
  );
}

function AdminOverviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[80px]" />
              {/* Only the 4th card (Market Supply) has a badge now */}
              {i === 3 && (
                <CardAction>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[180px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

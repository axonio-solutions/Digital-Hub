'use client'

import { Link } from '@tanstack/react-router'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartCard } from "@/components/ui/part-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
} from 'lucide-react'

// Live Hooks
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useBuyerRequests } from '@/features/buyer/hooks/use-buyer'

export function BuyerOverview() {
  const { data: user } = useAuth()
  const buyerId = user?.id || ''

  // Fetch live requests to calculate metrics and recent items
  const { data: requests = [], isLoading } = useBuyerRequests(buyerId)

  // 1. Calculate Metrics
  const activeRequests = requests.filter((r: any) => r.status === 'open')
  const fulfilledRequests = requests.filter(
    (r: any) => r.status === 'fulfilled',
  )
  const totalQuotes = requests.reduce(
    (acc: number, curr: any) => acc + (curr.quotes?.length || 0),
    0,
  )

  // 2. Extract Recent Items (max 3)
  const recentDemands = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3)


  if (isLoading && buyerId) {
    return <BuyerOverviewSkeleton />
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Acme Corp'}
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your parts requests today.
          </p>
        </div>
      </div>

      {/* Stats Overview - Premium Section Cards Style */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Requests */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Requests</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600 dark:text-blue-500">
              {activeRequests.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Live Interest
            </div>
            <div className="text-muted-foreground">Currently seeking market offers</div>
          </CardFooter>
        </Card>

        {/* Offers Received */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Offers Received</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-600 dark:text-emerald-500">
              {totalQuotes}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Quote Volume
            </div>
            <div className="text-muted-foreground">Supply responses across all requests</div>
          </CardFooter>
        </Card>

        {/* Fulfilled */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Fulfilled</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600 dark:text-orange-500">
              {fulfilledRequests.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Success Rate
            </div>
            <div className="text-muted-foreground">Successfully matched inquiries</div>
          </CardFooter>
        </Card>

        {/* Total Volume */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Volume</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600 dark:text-purple-500">
              {requests.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              History
            </div>
            <div className="text-muted-foreground">Lifetime marketplace interactions</div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold tracking-tight">Recent Requests</h3>
            <p className="text-sm text-muted-foreground">Monitor your latest marketplace activity</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/requests">View all</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-20 rounded-lg border-2 border-dashed bg-muted/50">
              <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <Search className="size-8" />
              </div>
              <h3 className="text-lg font-semibold">No Requests Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Post your first part request to start receiving offers.</p>
            </div>
          ) : (
            recentDemands.map((req: any) => (
              <PartCard 
                key={req.id}
                id={req.id}
                title={req.partName}
                brand={req.vehicleBrand || req.brand?.brand}
                modelYear={req.modelYear}
                category={req.category?.name}
                region={req.brand?.clusterRegion}
                imageUrls={req.imageUrls}
                quotesCount={req.quotes?.length}
                createdAt={req.createdAt}
                notes={req.notes}
                actionHref="/dashboard/requests/$requestId"
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function BuyerOverviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[80px]" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-3 w-[180px]" />
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[Array.from({ length: 3 })].map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  )
}


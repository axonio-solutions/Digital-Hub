import { format } from 'date-fns'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  XOctagon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {} from '@/features/buyer/hooks/use-buyer'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OrderHistory() {
  const { data: user } = useAuth()
  const buyerId = user?.id || ''

  // We reuse the existing BuyerRequests hook since it already pulls all requests
  const { data: requests = [], isLoading } = useBuyerRequests(buyerId)

  // Analytics Derivations
  const totalRequests = requests.length
  const fulfilledRequests = requests.filter(
    (r: any) => r.status === 'fulfilled',
  ).length
  const openRequests = requests.filter((r: any) => r.status === 'open').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
          >
            <Clock className="mr-1 h-3 w-3" /> Browsing Quotes
          </Badge>
        )
      case 'fulfilled':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" /> Purchased
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge
            variant="secondary"
            className="bg-red-500/10 text-red-600 hover:bg-red-500/20"
          >
            <XOctagon className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
        <p className="text-muted-foreground mt-1">
          Review your past spare part requests and track your analytics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests Made
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Parts Purchased
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fulfilledRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully matched with sellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Searches
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently collecting quotes
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading history...</div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Part Requested</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quotes</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No order history found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.partName}</div>
                      {req.oemNumber && (
                        <div className="text-xs text-muted-foreground">
                          OEM: {req.oemNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.vehicleBrand} {req.modelYear}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>{req.quotes.length} offer(s)</TableCell>
                    <TableCell className="text-right">
                      {req.status === 'open' ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/dashboard`}>
                            Review <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          Closed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


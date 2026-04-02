'use client'

import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Activity,
  CheckCircle2,
  FileText,
  PlusCircle,
} from 'lucide-react'
import { RequestPartForm } from '@/features/requests/components/request-form'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { buyerColumns } from './buyer-columns'
import { 
  IconCircleCheckFilled, 
  IconLoader,
  IconCircleXFilled 
} from '@tabler/icons-react'

// Live Hooks!
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useBuyerRequests } from '@/features/buyer/hooks/use-buyer'

export function BuyerRequests() {
  // 1. Get current logged in buyer
  const { data: user } = useAuth()
  const buyerId = user?.id || ''
  const navigate = useNavigate()

  // 2. Fetch live data
  const { data: requests = [], isLoading, isError } = useBuyerRequests(buyerId)

  // 3. Extract unique brands for filtering
  const brandOptions = useMemo(() => {
    const brands = new Set<string>()
    requests.forEach((r: any) => {
      const brandName = r.vehicleBrand || r.brand?.brand
      if (brandName) brands.add(brandName)
    })
    return Array.from(brands)
      .sort()
      .map((brand) => ({
        label: brand,
        value: brand,
      }))
  }, [requests])

  // Calculate stats based on live data
  const activeRequestsCount = requests.filter(
    (r: any) => r.status === 'open',
  ).length
  const totalQuotesReceived = requests.reduce(
    (acc: number, curr: any) => acc + (curr.quotes?.length || 0),
    0,
  )
  const fulfilledRequestsCount = requests.filter(
    (r: any) => r.status === 'fulfilled',
  ).length

  if (isLoading && buyerId)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading marketplace requests...</p>
        </div>
      </div>
    )
    
  if (isError)
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-destructive">
        Failed to load marketplace demands. Please try again.
      </div>
    )

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Market Requests</h2>
          <p className="text-muted-foreground text-sm">
            Manage and track your automotive part requests.
          </p>
        </div>
        <div className="flex items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="me-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
                <DialogDescription>
                  Fill in the details for the part you are looking for.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <RequestPartForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequestsCount}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offers Received
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotesReceived}</div>
            <p className="text-xs text-muted-foreground">Total across requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fulfilledRequestsCount}</div>
            <p className="text-xs text-muted-foreground">Completed acquisitions</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 gap-4">
        <DataTable
          data={requests}
          columns={useMemo(() => buyerColumns((action) => {
            if (action.type === 'view_request') {
              navigate({ 
                to: '/dashboard/requests/$requestId', 
                params: { requestId: action.item.id } 
              })
            }
          }), [navigate])}
          onRowClick={(row) => {
            navigate({ 
              to: '/dashboard/requests/$requestId', 
              params: { requestId: row.id } 
            })
          }}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              searchColumn="partName"
              searchPlaceholder="Filter demands..."
              facetedFilters={[
                {
                  column: "status",
                  title: "Status",
                  options: [
                    { label: "Open", value: "open", icon: IconLoader },
                    { label: "Fulfilled", value: "fulfilled", icon: IconCircleCheckFilled },
                    { label: "Cancelled", value: "cancelled", icon: IconCircleXFilled },
                  ]
                },
                {
                  column: "vehicleBrand",
                  title: "Brand",
                  options: brandOptions,
                }
              ]}
            />
          )}
        />
      </div>
    </div>
  )
}

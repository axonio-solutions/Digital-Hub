import { useMemo, useState } from 'react'
import {
  Activity,
  DollarSign,
  FilterX,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react'
import { MarketplaceDataTable } from './marketplace-data-table'
import { Modal } from '@/components/ui/modal'
import { SubmitQuoteForm } from './submit-quote-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Live Hooks!
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useOpenRequests } from '@/features/requests/hooks/use-requests'

export function MarketplaceFeed() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')

  // 1. Get current logged in seller
  const { data: user } = useAuth()
  const sellerId = user?.id || ''

  // 2. Fetch live data
  const { data: requests = [], isLoading, isError } = useOpenRequests()

  // Extract unique brands for the filter dropdown
  const uniqueBrands = useMemo(() => {
    const brands = new Set(requests.map((r: any) => r.vehicleBrand))
    return Array.from(brands).sort()
  }, [requests])

  // Advanced Filtering Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req: any) => {
      const matchesSearch =
        searchQuery === '' ||
        req.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.oemNumber &&
          req.oemNumber.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesBrand =
        brandFilter === 'all' || req.vehicleBrand === brandFilter

      return matchesSearch && matchesBrand
    })
  }, [requests, searchQuery, brandFilter])

  const openOpportunities = requests.length
  const activeQuotes = requests.reduce(
    (acc: number, req: any) =>
      acc +
      (req.quotes?.filter((q: any) => q.sellerId === sellerId).length || 0),
    0,
  )

  if (isLoading && sellerId)
    return (
      <div className="flex h-64 items-center justify-center">
        Loading marketplace feed...
      </div>
    )
  if (isError)
    return (
      <div className="flex i-64 items-center justify-center text-red-500">
        Failed to load marketplace data.
      </div>
    )

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketplace Feed</h2>
        <p className="text-muted-foreground">
          Browse real-time requests from buyers across Algeria and submit your
          quotes.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Open Opportunities
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {openOpportunities}
            </div>
            <p className="text-xs text-blue-600/80">
              Parts currently needed in the network
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Active Quotes
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Quotes awaiting buyer response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">See Earnings Route</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">See Earnings Route</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feed with Filters */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Available Requests</CardTitle>
              <CardDescription>
                Find the parts you stock and submit competitive pricing.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search part or OEM..."
                  className="ps-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Brand Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {uniqueBrands.map((brand: any) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || brandFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('')
                    setBrandFilter('all')
                  }}
                  title="Clear Filters"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MarketplaceDataTable 
            data={filteredRequests} 
            type="opportunity"
            onAction={(action) => {
              if (action.type === 'send_offer' || action.type === 'view_request') {
                setSelectedRequest(action.item)
              }
            }}
          />
        </CardContent>
      </Card>

      <Modal
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        title="Submit a Quote"
        description="Offer your best price for this part. The buyer will receive your quote instantly."
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Vehicle</div>
                  <div className="font-bold">{selectedRequest.vehicleBrand} ({selectedRequest.modelYear})</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Part Name</div>
                  <div className="font-bold">{selectedRequest.partName}</div>
                </div>
              </div>
            </div>
            <SubmitQuoteForm
              requestId={selectedRequest.id}
              sellerId={sellerId}
              category={selectedRequest.category?.name || selectedRequest.category}
              vehicleInfo={{
                brand: selectedRequest.vehicleBrand,
                model: selectedRequest.vehicleModel,
                year: selectedRequest.modelYear
              }}
              onSuccess={() => setSelectedRequest(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

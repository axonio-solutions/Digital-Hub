import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Activity, DollarSign, TrendingUp, Search, FilterX } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Live Hooks!
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useOpenRequests } from "@/features/requests/hooks/use-requests"
import { SubmitQuoteForm } from "./submit-quote-form"

export function SellerQuotes() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Filtering State
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState("all")

  // 1. Get current logged in seller
  const { data: user } = useAuth()
  const sellerId = user?.id || ""

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
      const matchesSearch = searchQuery === "" ||
        req.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.oemNumber && req.oemNumber.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesBrand = brandFilter === "all" || req.vehicleBrand === brandFilter

      return matchesSearch && matchesBrand
    })
  }, [requests, searchQuery, brandFilter])

  const openOpportunities = requests.length
  const activeQuotes = requests.reduce((acc: number, req: any) => acc + (req.quotes?.filter((q: any) => q.sellerId === sellerId).length || 0), 0)

  if (isLoading && sellerId) return <div className="flex h-64 items-center justify-center">Loading marketplace feed...</div>
  if (isError) return <div className="flex i-64 items-center justify-center text-red-500">Failed to load marketplace data.</div>

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketplace Feed</h2>
        <p className="text-muted-foreground">
          Browse real-time requests from buyers across Algeria and submit your quotes.
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
            <div className="text-2xl font-bold text-blue-700">{openOpportunities}</div>
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
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              See Earnings Route
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Win Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              See Earnings Route
            </p>
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
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search part or OEM..."
                  className="pl-9"
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
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || brandFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchQuery(""); setBrandFilter("all") }}
                  title="Clear Filters"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Brand / Year</TableHead>
                <TableHead>Part Requested</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead className="text-right border-l pl-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-3 opacity-20" />
                    No requests match your current filters.
                    <Button variant="link" onClick={() => { setSearchQuery(""); setBrandFilter("all") }}>Clear all filters</Button>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.map((req: any) => {
                const hasMyQuote = req.quotes?.some((q: any) => q.sellerId === sellerId);

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-semibold">{req.vehicleBrand}</div>
                      <div className="text-xs text-muted-foreground">{req.modelYear}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{req.partName}</div>
                      {req.oemNumber && (
                        <div className="text-xs text-slate-500 font-mono mt-1">OEM: {req.oemNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.quotes && req.quotes.length > 0 ? (
                        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                          {req.quotes.length} Quotes Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          Be the first!
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right border-l pl-4">
                      {hasMyQuote ? (
                        <Button size="sm" variant="secondary" disabled className="opacity-70">
                          Quote Submitted
                        </Button>
                      ) : (
                        <Dialog
                          open={selectedRequest?.id === req.id}
                          onOpenChange={(isOpen) => {
                            if (!isOpen) {
                              setSelectedRequest(null)
                            } else {
                              setSelectedRequest(req)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                              View & Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Submit a Quote</DialogTitle>
                              <DialogDescription>
                                Offer your best price for this part. The buyer will receive your quote instantly.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground mb-1">Vehicle</div>
                                  <div className="font-medium">{req.vehicleBrand} ({req.modelYear})</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Part Name</div>
                                  <div className="font-medium">{req.partName}</div>
                                </div>
                                {req.oemNumber && (
                                  <div className="col-span-2 pt-2 border-t border-slate-200">
                                    <div className="text-muted-foreground mb-1">OEM / Part Number</div>
                                    <div className="font-mono text-xs bg-white p-1.5 rounded border inline-block">{req.oemNumber}</div>
                                  </div>
                                )}
                                {req.notes && (
                                  <div className="col-span-2 pt-2 border-t border-slate-200">
                                    <div className="text-muted-foreground mb-1">Buyer Notes</div>
                                    <div className="italic text-slate-700 flex flex-wrap gap-2 mt-1 lowercase">
                                      {req.imageUrls && req.imageUrls.length > 0 ? (
                                        <div className="w-full mb-2 flex gap-2 overflow-x-auto pb-2">
                                          {req.imageUrls.map((url: string, idx: number) => (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block shrink-0">
                                              <img src={url} alt={`Part Attached ${idx}`} className="h-16 w-16 object-cover rounded shadow-sm border" />
                                            </a>
                                          ))}
                                        </div>
                                      ) : null}
                                      <span>{req.notes}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <SubmitQuoteForm
                              requestId={req.id}
                              sellerId={sellerId}
                              onSuccess={() => setSelectedRequest(null)}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

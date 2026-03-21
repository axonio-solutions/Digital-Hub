import { useState } from "react"
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
import { PlusCircle, Activity, FileText, CheckCircle2, DollarSign, MessageCircle, Phone, Award } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RequestPartForm } from "./request-form"

// Live Hooks!
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useBuyerRequests } from "@/features/requests/hooks/use-requests"
import { useAcceptQuote } from "@/features/quotes/hooks/use-quotes"

export function BuyerRequests() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [acceptedQuote, setAcceptedQuote] = useState<any>(null)
  
  // 1. Get current logged in buyer
  const { data: user } = useAuth()
  const buyerId = user?.id || ""

  // 2. Fetch live data
  const { data: requests = [], isLoading, isError } = useBuyerRequests(buyerId)
  
  // 3. Mutation to accept quote
  const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote()

  // Calculate stats based on live data
  const activeRequestsCount = requests.filter((r: any) => r.status === 'open').length
  const totalQuotesReceived = requests.reduce((acc: number, curr: any) => acc + (curr.quotes?.length || 0), 0)
  const fulfilledRequestsCount = requests.filter((r: any) => r.status === 'fulfilled').length

  const handleAcceptQuote = (quote: any, request: any) => {
    acceptQuote(
      { quoteId: quote.id, requestId: request.id },
      {
        onSuccess: () => {
          setAcceptedQuote(quote)
        }
      }
    )
  }

  if (isLoading && buyerId) return <div className="flex h-64 items-center justify-center">Loading requests...</div>
  if (isError) return <div className="flex h-64 items-center justify-center text-red-500">Failed to load dashboard data.</div>

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your spare part requests and quotes from sellers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Spare Parts</DialogTitle>
                <DialogDescription>
                  Submit exactly what you need. Connected sellers will quote you directly.
                </DialogDescription>
              </DialogHeader>
              <RequestPartForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequestsCount}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for quotes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quotes Received
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotesReceived}</div>
            <p className="text-xs text-muted-foreground">
              Across all open requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order History</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fulfilledRequestsCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully fulfilled parts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Saved
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Feature coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Requests & Quotes</CardTitle>
            <CardDescription>
              Review the quotes sellers have submitted for your parts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        You haven't requested any parts yet. Click "New Request" to start!
                      </TableCell>
                   </TableRow>
                ) : requests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-xs">{req.id.substring(0,8)}</TableCell>
                    <TableCell>{req.partName}</TableCell>
                    <TableCell>{req.vehicleBrand}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {req.status === "open" && <Badge variant="default" className="bg-blue-500">Open</Badge>}
                      {req.status === "fulfilled" && <Badge variant="default" className="bg-green-500">Fulfilled</Badge>}
                      {req.status === "cancelled" && <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button 
                             size="sm" 
                             variant={req.quotes && req.quotes.length > 0 ? "default" : "secondary"}
                             onClick={() => {
                               setSelectedRequest(req)
                               // Only reset accepted quote if we're opening a DIFFERENT request
                               // or if the request isn't fulfilled
                               if (req.status !== "fulfilled" || !acceptedQuote) {
                                 setAcceptedQuote(null) 
                               }
                             }}
                            >
                             {req.quotes && req.quotes.length > 0 ? `View ${req.quotes.length} Quotes` : "Details"}
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Quotes for {selectedRequest?.partName}</DialogTitle>
                            <DialogDescription>
                              Review offers from verified sellers. Accept the best one to get their direct contact info.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRequest && !acceptedQuote && selectedRequest.status === 'open' && (
                            <div className="space-y-4 py-4">
                              {!selectedRequest.quotes || selectedRequest.quotes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                  <p>No quotes received yet for this request.</p>
                                </div>
                              ) : (
                                <div className="grid gap-4">
                                  {selectedRequest.quotes.map((quote: any) => (
                                    <div key={quote.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold">{quote.seller?.name || "Verified Seller"}</h4>
                                          {quote.condition === 'new' ? (
                                             <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] uppercase">New Part</Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] uppercase">Used/Casse</Badge>
                                          )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Warranty: <span className="font-medium text-foreground">{quote.warranty || "None"}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                                        <div className="text-xl font-bold text-green-600 whitespace-nowrap">
                                          {quote.price.toLocaleString()} DZD
                                        </div>
                                        <Button 
                                          size="sm" 
                                          className="w-full sm:w-auto"
                                          onClick={() => handleAcceptQuote(quote, selectedRequest)}
                                          disabled={isAccepting}
                                        >
                                           {isAccepting ? "Accepting..." : "Accept Quote"}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {selectedRequest?.status === 'fulfilled' && !acceptedQuote && (
                             <div className="text-center py-8 text-muted-foreground">
                               <Award className="mx-auto h-8 w-8 mb-2 text-green-500 opacity-50" />
                               <p>You have already accepted a quote for this part.</p>
                             </div>
                          )}

                          {acceptedQuote && (
                            <div className="py-6 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                               <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                 <Award className="h-8 w-8 text-green-600" />
                               </div>
                               <div>
                                 <h3 className="text-2xl font-bold tracking-tight mb-2">Quote Accepted!</h3>
                                 <p className="text-muted-foreground max-w-sm mx-auto">
                                   You selected the quote from <strong>{acceptedQuote.seller?.name || "Seller"}</strong> for {acceptedQuote.price.toLocaleString()} DZD.
                                 </p>
                               </div>

                               <div className="bg-muted/30 border rounded-xl p-6 max-w-md mx-auto space-y-4">
                                  <p className="text-sm text-balance text-muted-foreground mb-4">
                                    Contact the seller directly to arrange payment (Cash on Delivery/Pickup) and logistics.
                                  </p>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <Button asChild size="lg" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
                                      {/* Using default +213 logic for the WhatsApp link */}
                                      <a href={`https://wa.me/${(acceptedQuote.seller?.phoneNumber || '213000000').replace('+','')}`} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        WhatsApp
                                      </a>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="w-full">
                                      <a href={`tel:${acceptedQuote.seller?.phoneNumber || '+213000000'}`}>
                                        <Phone className="mr-2 h-5 w-5" />
                                        Call Now
                                      </a>
                                    </Button>
                                  </div>
                               </div>

                               <Button variant="ghost" className="mt-4" onClick={() => setAcceptedQuote(null)}>
                                 Back Overview
                               </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


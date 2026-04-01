import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeftCircle,
  Award,
  MessageCircle,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { useState } from 'react'
import type {User} from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

import { useAuth } from '@/features/auth/hooks/use-auth'
import {} from '@/features/buyer/hooks/use-buyer'
import { useAcceptQuote } from '@/features/quotes/hooks/use-quotes'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_authed/dashboard/offers/')({
  component: OffersReceivedRoute,
})

function OffersReceivedRoute() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [acceptedQuote, setAcceptedQuote] = useState<any>(null)

  const { data: user } = useAuth()
  const buyerId = (user as any as User)?.id || ''

  const { data: allRequests = [], isLoading } = useBuyerRequests(buyerId)
  const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote()

  // Filter requests to ONLY those that are open and have at least 1 quote
  const actionableRequests = allRequests.filter(
    (req: any) => req.status === 'open' && req.quotes && req.quotes.length > 0,
  )

  const handleAcceptQuote = (quote: any, request: any) => {
    acceptQuote(
      { quoteId: quote.id, requestId: request.id },
      {
        onSuccess: () => {
          setAcceptedQuote(quote)
        },
      },
    )
  }

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        Loading Offers...
      </div>
    )

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offers Received</h2>
          <p className="text-muted-foreground">
            Review live quotes from sellers for your active requests.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1 shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-3 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Actionable Quotes ({actionableRequests.length})
            </CardTitle>
            <CardDescription>
              These requests require your attention. Accept a quote to finalize
              the deal.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionableRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                        <p>You have no active offers to review.</p>
                        <Button variant="link" asChild>
                          <a href="/dashboard">
                            <ArrowLeftCircle className="mr-2 h-4 w-4" /> Go back
                            to dashboard
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  actionableRequests.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-xs">
                        {req.id.substring(0, 8)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {req.partName}
                      </TableCell>
                      <TableCell>{req.vehicleBrand}</TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-primary hover:bg-primary/80"
                        >
                          {req.quotes.length} Offer
                          {req.quotes.length > 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="animate-pulse shadow-sm"
                              onClick={() => {
                                setSelectedRequest(req)
                                setAcceptedQuote(null)
                              }}
                            >
                              Review Quotes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                              <DialogTitle>
                                Quotes for {selectedRequest?.partName}
                              </DialogTitle>
                              <DialogDescription>
                                Review offers from verified sellers. Accept the
                                best one to get their direct contact info.
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRequest &&
                              !acceptedQuote &&
                              selectedRequest.status === 'open' && (
                                <div className="space-y-4 py-4">
                                  <div className="grid gap-4">
                                    {selectedRequest.quotes.map(
                                      (quote: any) => (
                                        <div
                                          key={quote.id}
                                          className="border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background"
                                        >
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-semibold">
                                                {quote.seller?.name ||
                                                  'Verified Seller'}
                                              </h4>
                                              {quote.condition === 'new' ? (
                                                <Badge
                                                  variant="outline"
                                                  className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] uppercase"
                                                >
                                                  New Part
                                                </Badge>
                                              ) : (
                                                <Badge
                                                  variant="outline"
                                                  className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] uppercase"
                                                >
                                                  Used/Casse
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              Warranty:{' '}
                                              <span className="font-medium text-foreground">
                                                {quote.warranty || 'None'}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex flex-col items-start gap-3 sm:items-end">
                                            <div className="text-xl font-bold text-green-600 whitespace-nowrap">
                                              {quote.price.toLocaleString()} DZD
                                            </div>
                                            <Button
                                              size="sm"
                                              className="w-full sm:w-auto"
                                              onClick={() =>
                                                handleAcceptQuote(
                                                  quote,
                                                  selectedRequest,
                                                )
                                              }
                                              disabled={isAccepting}
                                            >
                                              {isAccepting
                                                ? 'Accepting...'
                                                : 'Accept Deal'}
                                            </Button>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {acceptedQuote && (
                              <div className="py-6 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                  <Award className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold tracking-tight mb-2">
                                    Quote Accepted!
                                  </h3>
                                  <p className="text-muted-foreground max-w-sm mx-auto">
                                    You selected the quote from{' '}
                                    <strong>
                                      {acceptedQuote.seller?.name || 'Seller'}
                                    </strong>{' '}
                                    for {acceptedQuote.price.toLocaleString()}{' '}
                                    DZD.
                                  </p>
                                </div>

                                <div className="bg-muted/30 border rounded-xl p-6 max-w-md mx-auto space-y-4">
                                  <p className="text-sm text-balance text-muted-foreground mb-4">
                                    Contact the seller directly to arrange
                                    payment and logistics.
                                  </p>

                                  <div className="grid grid-cols-2 gap-3">
                                    <Button
                                      asChild
                                      size="lg"
                                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white"
                                    >
                                      <a
                                        href={`https://wa.me/${(acceptedQuote.seller?.phoneNumber || '213000000').replace('+', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        WhatsApp
                                      </a>
                                    </Button>
                                    <Button
                                      asChild
                                      size="lg"
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <a
                                        href={`tel:${acceptedQuote.seller?.phoneNumber || `+213000000`}`}
                                      >
                                        <Phone className="mr-2 h-5 w-5" />
                                        Call Now
                                      </a>
                                    </Button>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  className="mt-4"
                                  onClick={() => setSelectedRequest(null)}
                                >
                                  Close
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


import { useState, useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useOpenRequests } from "@/features/requests/hooks/use-requests"
import { useSellerQuotes } from "@/features/quotes/hooks/use-quotes"
import { SellerMarketplaceListView } from "./seller-marketplace-list-view"
import { SellerMarketplaceGridView } from "./seller-marketplace-grid-view"
import { SubmitQuoteForm } from "./submit-quote-form"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    LayoutGrid,
    List as ListIcon,
    Search,
    Filter,
    Briefcase,
    Send,
    TrendingUp,
    Zap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function SellerMarketplaceHub() {
    const [view, setView] = useState<"list" | "grid">("grid")
    const [search, setSearch] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

    // Data Fetching
    const { data: user } = useAuth()
    const sellerId = user?.id || ""
    const { data: openRequests = [], isLoading: loadingRequests } = useOpenRequests()
    const { data: myQuotes = [], isLoading: loadingQuotes } = useSellerQuotes(sellerId)

    // Derived State
    const stats = useMemo(() => {
        const availableCount = openRequests.filter((req: any) => !myQuotes.some((q: any) => q.requestId === req.id)).length
        const activeBids = myQuotes.filter((q: any) => q.status === 'pending')
        const avgBid = activeBids.length > 0
            ? activeBids.reduce((acc: number, q: any) => acc + q.price, 0) / activeBids.length
            : 0

        return { availableCount, activeCount: activeBids.length, avgBid }
    }, [openRequests, myQuotes])

    // Filter Logic
    const openOpportunities = useMemo(() => {
        return openRequests
            .filter((req: any) => !myQuotes.some((q: any) => q.requestId === req.id))
            .filter((req: any) =>
                req.partName.toLowerCase().includes(search.toLowerCase()) ||
                req.vehicleBrand.toLowerCase().includes(search.toLowerCase())
            )
    }, [openRequests, myQuotes, search])

    const activeQuotes = useMemo(() => {
        // We want to return the Requests that have an active quote from this seller
        return myQuotes
            .filter((q: any) => q.status === 'pending')
            .map((q: any) => ({
                ...q.request,
                quotePrice: q.price,
                quoteStatus: q.status,
                id: q.requestId // Use request ID for consistency in views
            }))
            .filter((req: any) =>
                req.partName.toLowerCase().includes(search.toLowerCase()) ||
                req.vehicleBrand.toLowerCase().includes(search.toLowerCase())
            )
    }, [myQuotes, search])

    const handleAction = (item: any) => {
        setSelectedRequest(item)
        setIsQuoteModalOpen(true)
    }

    if (loadingRequests || loadingQuotes) {
        return (
            <div className="flex flex-col space-y-4 animate-pulse">
                <div className="h-10 w-48 bg-slate-100 rounded" />
                <div className="grid grid-cols-3 gap-4 h-24">
                    <div className="bg-slate-50 rounded-xl" />
                    <div className="bg-slate-50 rounded-xl" />
                    <div className="bg-slate-50 rounded-xl" />
                </div>
                <div className="h-96 w-full bg-slate-50 rounded-xl" />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-8 pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Marketplace Hub</h2>
                    <p className="text-muted-foreground">Find new opportunities and track your active bids in one place.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Briefcase className="size-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">Jobs Available</p>
                            <p className="text-xl font-black text-emerald-700">{stats.availableCount}</p>
                        </div>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Send className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">Active Bids</p>
                            <p className="text-xl font-black text-blue-700">{stats.activeCount}</p>
                        </div>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm hidden md:flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <TrendingUp className="size-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">Avg. Bid Price</p>
                            <p className="text-lg font-black">{stats.avgBid.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                    <Input
                        placeholder="Search for parts, brands, or specific vehicles..."
                        className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary/10 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border">
                        <Button
                            variant={view === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 text-xs gap-2 rounded-lg"
                            onClick={() => setView("list")}
                        >
                            <ListIcon className="size-3.5" />
                            List
                        </Button>
                        <Button
                            variant={view === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 text-xs gap-2 rounded-lg"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="size-3.5" />
                            Grid
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" className="h-11 px-4 rounded-xl gap-2 border-slate-200">
                        <Filter className="size-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="open" className="space-y-6">
                <div className="flex items-center justify-between border-b pb-px">
                    <TabsList className="bg-transparent h-14 p-0 gap-8">
                        <TabsTrigger
                            value="open"
                            className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 font-bold text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none"
                        >
                            Open Opportunities
                            <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-600 border-none px-1.5 h-4 text-[10px]">{openOpportunities.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="active"
                            className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 font-bold text-muted-foreground data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                        >
                            Your Active Quotes
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-none px-1.5 h-4 text-[10px]">{activeQuotes.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="open" className="mt-0">
                    {view === "list" ? (
                        <SellerMarketplaceListView data={openOpportunities} type="opportunity" onAction={handleAction} />
                    ) : (
                        <SellerMarketplaceGridView data={openOpportunities} type="opportunity" onAction={handleAction} />
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-0">
                    {view === "list" ? (
                        <SellerMarketplaceListView data={activeQuotes} type="active" onAction={handleAction} />
                    ) : (
                        <SellerMarketplaceGridView data={activeQuotes} type="active" onAction={handleAction} />
                    )}
                </TabsContent>
            </Tabs>

            {/* Quote dialog */}
            <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
                    <DialogHeader className="p-8 bg-slate-50 border-b">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Zap className="size-6 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight">Submit Quote</DialogTitle>
                                <DialogDescription>
                                    Offer your best price for the {selectedRequest?.partName}.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="px-8 py-6">
                        <SubmitQuoteForm
                            requestId={selectedRequest?.id}
                            sellerId={sellerId}
                            onSuccess={() => setIsQuoteModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

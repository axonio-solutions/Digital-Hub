import { useAuth } from "@/features/auth/hooks/use-auth"
import { useSellerQuotes } from "@/features/quotes/hooks/use-quotes"
import { SellerQuotesListView } from "./seller-quotes-list-view"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function SellerQuotesHub() {
    const { data: user } = useAuth()
    const sellerId = user?.id || ""

    const { data: myQuotes = [], isLoading } = useSellerQuotes(sellerId)

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="h-8 w-64 bg-slate-100 animate-pulse rounded" />
                <div className="h-20 w-full bg-slate-50 animate-pulse rounded-lg" />
                <div className="h-96 w-full bg-slate-50 animate-pulse rounded-lg" />
            </div>
        )
    }

    // Categorize quotes based on their OWN status determined in the backend
    const pendingQuotes = myQuotes.filter((q: any) => q.status === 'pending')
    const wonQuotes = myQuotes.filter((q: any) => q.status === 'accepted')
    const lostQuotes = myQuotes.filter((q: any) =>
        q.status === 'rejected' ||
        (q.request?.status === 'fulfilled' && q.status !== 'accepted')
    )

    return (
        <div className="flex flex-col space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">My Sent Quotes</h2>
                    <p className="text-muted-foreground">
                        Track and manage all offers you've submitted to the marketplace.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
                        {myQuotes.length} Total Bids
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex items-center justify-between border-b pb-1">
                    <TabsList className="bg-transparent h-12 p-0 gap-8">
                        <TabsTrigger
                            value="all"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            All Quotes
                        </TabsTrigger>
                        <TabsTrigger
                            value="won"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
                        >
                            Won
                            <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-1.5 h-4 text-[10px]">{wonQuotes.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                        >
                            Pending
                            <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5 h-4 text-[10px]">{pendingQuotes.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="lost"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-slate-400 data-[state=active]:text-slate-600 data-[state=active]:shadow-none"
                        >
                            Lost / Closed
                            <Badge className="ml-2 bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-1.5 h-4 text-[10px]">{lostQuotes.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                    <SellerQuotesListView data={myQuotes} />
                </TabsContent>

                <TabsContent value="won" className="mt-0">
                    <SellerQuotesListView data={wonQuotes} />
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                    <SellerQuotesListView data={pendingQuotes} />
                </TabsContent>

                <TabsContent value="lost" className="mt-0">
                    <SellerQuotesListView data={lostQuotes} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

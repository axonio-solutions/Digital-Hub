"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    LayoutGrid,
    List,
    Plus,
    Search,
    Filter,
    MessageCircle,
    Phone,
    Award,
    BadgeCheck,
    History
} from "lucide-react";
import { toast } from "sonner";

// Components
import { RequestsListView } from "./requests-list-view";
import { RequestsGridView } from "./requests-grid-view";
import { NewPartRequestForm } from "./new-request-form";

// Hooks
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useBuyerRequests } from "@/features/requests/hooks/use-requests";
import { useAcceptQuote } from "@/features/quotes/hooks/use-quotes";
import { Badge } from "@/components/ui/badge";

export function RequestsHub() {
    const [view, setView] = useState<"list" | "grid">("list");
    const [search, setSearch] = useState("");
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

    // Review Quotes Logic
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [acceptedQuote, setAcceptedQuote] = useState<any>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Data Fetching
    const { data: user } = useAuth();
    const buyerId = user?.id || "";
    const { data: requests = [] } = useBuyerRequests(buyerId);
    const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote();

    // Filtering
    const filteredRequests = requests.filter((req: any) =>
        req.partName.toLowerCase().includes(search.toLowerCase()) ||
        req.vehicleBrand.toLowerCase().includes(search.toLowerCase())
    );

    const handleReview = (request: any) => {
        setSelectedRequest(request);
        setAcceptedQuote(null);
        setIsReviewOpen(true);
    };

    const handleAcceptQuote = (quote: any, request: any) => {
        acceptQuote(
            { quoteId: quote.id, requestId: request.id },
            {
                onSuccess: () => {
                    setAcceptedQuote(quote);
                    toast.success("Quote accepted! Contact information revealed.");
                },
                onError: () => {
                    toast.error("Failed to accept quote.");
                }
            }
        );
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Demands Hub</h2>
                    <p className="text-muted-foreground text-sm">Manage all your part requests and view incoming offers.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" />
                                New Demand
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
                            <div className="p-8">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold">Submit Part Demand</DialogTitle>
                                    <DialogDescription>
                                        Provide details about the automotive spare part you are looking for.
                                    </DialogDescription>
                                </DialogHeader>
                                <NewPartRequestForm
                                    onSuccess={() => setIsNewRequestOpen(false)}
                                    onCancel={() => setIsNewRequestOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-muted-foreground/10 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Search by part or brand..."
                        className="pl-9 h-9 border-muted-foreground/20 focus-visible:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible">
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-muted">
                        <Button
                            variant={view === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5 shadow-none"
                            onClick={() => setView("list")}
                        >
                            <List className="size-3.5" />
                            List
                        </Button>
                        <Button
                            variant={view === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5 shadow-none"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="size-3.5" />
                            Grid
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-2 border-muted-foreground/20">
                        <Filter className="size-3.5" />
                        Advanced Filters
                    </Button>
                </div>
            </div>

            {/* Main Content Areas */}
            {view === "list" ? (
                <RequestsListView data={filteredRequests} onReview={handleReview} />
            ) : (
                <RequestsGridView data={filteredRequests} onReview={handleReview} />
            )}

            {/* Quote Review Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-[750px] overflow-hidden p-0 border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-muted/30 border-b">
                        <div className="flex items-center gap-3 mb-1">
                            <DialogTitle className="text-xl">Review Offers</DialogTitle>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {selectedRequest?.partName}
                            </Badge>
                        </div>
                        <DialogDescription>
                            Review competitive quotes from verified sellers for your {selectedRequest?.vehicleBrand} demand.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[70vh] overflow-y-auto p-6">
                        {!acceptedQuote && selectedRequest?.status === 'open' && (
                            <div className="space-y-6">
                                {!selectedRequest.quotes || selectedRequest.quotes.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed">
                                        <History className="mx-auto h-10 w-10 mb-3 text-muted-foreground/30" />
                                        <p className="text-muted-foreground font-medium">No one has quoted yet.</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1 px-12">We've broadcasted your demand to our network. You'll receive a notification as soon as a seller responds.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {selectedRequest.quotes.map((quote: any) => (
                                            <div key={quote.id} className="relative group border border-muted-foreground/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card hover:border-primary/40 transition-all shadow-sm">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                                                            <BadgeCheck className="size-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm">{quote.seller?.name || "Verified Professional"}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {quote.condition === 'new' ? (
                                                                    <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold text-blue-600 bg-blue-50 border-blue-100">Factory New</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold text-orange-600 bg-orange-50 border-orange-100">Used / Partout</Badge>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground px-1 border-l">Warranty: {quote.warranty || "None"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start sm:items-end gap-3">
                                                    <div className="text-2xl font-black text-primary">
                                                        {quote.price.toLocaleString()} <span className="text-xs font-normal">DZD</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto rounded-lg px-6 font-bold"
                                                        onClick={() => handleAcceptQuote(quote, selectedRequest)}
                                                        disabled={isAccepting}
                                                    >
                                                        {isAccepting ? "Processing..." : "Secure Part"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(selectedRequest?.status === 'fulfilled' && !acceptedQuote) && (
                            <div className="text-center py-12 space-y-4">
                                <div className="mx-auto size-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                                    <Award className="size-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">Demand Fulfilled</h3>
                                    <p className="text-muted-foreground text-sm">You have already completed this transaction.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(false)}>Close Window</Button>
                            </div>
                        )}

                        {acceptedQuote && (
                            <div className="py-6 space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                    <Award className="h-10 w-10 text-green-600" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tighter">SUCCESS!</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        Contact <strong>{acceptedQuote.seller?.name || "the seller"}</strong> to finalize your purchase of {selectedRequest?.partName}.
                                    </p>
                                </div>

                                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 max-w-md mx-auto space-y-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary opacity-60">
                                        Seller Direct Access
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Button asChild size="lg" className="w-full rounded-2xl h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20">
                                            <a href={`https://wa.me/${(acceptedQuote.seller?.phoneNumber || '213000000').replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="mr-2 h-5 w-5 fill-white" />
                                                WhatsApp
                                            </a>
                                        </Button>
                                        <Button asChild size="lg" variant="outline" className="w-full h-14 rounded-2xl border-2 hover:bg-muted/50">
                                            <a href={`tel:${acceptedQuote.seller?.phoneNumber || '+213000000'}`}>
                                                <Phone className="mr-2 h-5 w-5" />
                                                Call Now
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                <Button variant="ghost" className="text-muted-foreground text-xs" onClick={() => setIsReviewOpen(false)}>
                                    Return to Hub
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client'

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { usePublicOpenRequests, usePublicTaxonomy } from "@/features/requests/hooks/use-requests";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { SendOfferDialog } from "./send-offer-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Modular Explore Components
import { CategoryBar } from './explore/category-bar';
import { MarketplaceFeed } from './explore/marketplace-feed';

export function PublicMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState<Array<string>>([]);
  const [urgency, setUrgency] = useState("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [sortOption, setSortOption] = useState("newest");

  const { t } = useTranslation(['home/explore', 'marketplace']);

  const { data: user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const limit = 12;

  // Derive role — strict equality, any value other than 'seller' is rejected
  const userRole: string | undefined =
    (user as any)?.user_metadata?.role ??
    (user as any)?.app_metadata?.role ??
    (user as any)?.role;

  const { data: taxonomyData } = usePublicTaxonomy();
  const {
    data: allRequests,
    isLoading: isLoadingReqs,
  } = usePublicOpenRequests({
    categoryId: selectedCategory,
    brandIds: selectedBrands,
    search: searchQuery,
    limit,
    offset: page * limit,
  });

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setUrgency("any");
    setSearchQuery("");
    setPage(0);
  };

  const sortedRequests = React.useMemo(() => {
    if (!allRequests) return [];
    let result = [...allRequests];

    if (urgency !== 'any') {
      result = result.filter((r: any) => r.urgency === urgency);
    }

    if (sortOption === 'urgency') {
      const urgencyOrder: Record<string, number> = { 'asap': 0, 'standard': 1 };
      result.sort((a: any, b: any) => (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99));
    } else {
      result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allRequests, sortOption, urgency]);

  /**
   * Zero-trust quote handler — re-validates auth + role + ownership at call time.
   */
  const handleQuote = (req: any) => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (userRole !== 'seller') {
      toast.error(t('errors.unauthorized_seller', 'Only sellers can send quotes.'));
      return;
    }
    if (req.buyerId === (user as any)?.id) return;
    setSelectedRequest(req);
  };

  return (
    // The Navbar is rendered by the _public layout route — this component
    // only renders the explore page body (CategoryBar + Feed + Footer).
    <div className="flex flex-col flex-1 bg-white dark:bg-slate-950">

      {/* ── CategoryFilterScroll ───────────────────────────────────────────────── */}
      <CategoryBar
        categories={taxonomyData?.categories || []}
        selectedCategory={selectedCategory}
        setSelectedCategory={(id) => { setSelectedCategory(id); setPage(0); }}
        brands={taxonomyData?.brands || []}
        selectedBrands={selectedBrands}
        setSelectedBrands={(brands) => { setSelectedBrands(brands); setPage(0); }}
        urgency={urgency}
        setUrgency={(u) => { setUrgency(u); setPage(0); }}
        onReset={handleResetFilters}
      />

      {/* ── Main Content Feed ─────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-6 lg:px-14 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              Available <span className="text-primary">Parts</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
              {sortedRequests.length} results matching your criteria
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSortOption(sortOption === 'newest' ? 'urgency' : 'newest')}
            className="h-11 px-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-bold text-xs uppercase tracking-widest"
          >
            Sort: {sortOption === 'newest' ? 'Newest' : 'Urgency'}
          </Button>
        </div>

        {/* PartCard grid — RBAC enforced inside MarketplaceFeed */}
        <MarketplaceFeed
          requests={sortedRequests}
          isLoading={isLoadingReqs}
          userId={(user as any)?.id}
          userRole={userRole}
          onQuote={handleQuote}
          onClearFilters={handleResetFilters}
        />

        {/* Pagination */}
        {sortedRequests.length > 0 && (
          <div className="mt-20 flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:text-primary transition-all"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="h-12 px-8 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-200 dark:border-slate-800">
              Page {page + 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:text-primary transition-all"
              onClick={() => setPage(p => p + 1)}
              disabled={sortedRequests.length < limit}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <SendOfferDialog
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        user={user}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 mt-20">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-14 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">
            M-Lila Marketplace
          </span>
          <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

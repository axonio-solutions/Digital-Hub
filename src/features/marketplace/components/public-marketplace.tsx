'use client'

import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight,
  Filter, Search, Settings, X, Zap, LayoutGrid
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { usePublicOpenRequests, usePublicTaxonomy } from "@/features/requests/hooks/use-requests";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { Input } from "@/components/ui/input";
import { RequestCard } from "./request-card";
import { SendOfferDialog } from "./send-offer-dialog";
import { BrandSelectionDialog } from "./brand-selection-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { NotificationBell } from "@/features/notifications";
import { UserDropdown } from "@/features/dashboard/components/layout/user-dropdown";

// New Explore Components
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
      result = result.filter(r => r.urgency === urgency);
    }

    if (sortOption === 'urgency') {
      const urgencyOrder: Record<string, number> = { 'asap': 0, 'standard': 1 };
      result.sort((a, b) => (urgencyOrder[a.urgency] ?? 99) - (urgencyOrder[b.urgency] ?? 99));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allRequests, sortOption, urgency]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* 1. Global Navigation Bar with Search Integration */}
      <header className="px-6 lg:px-14 h-20 flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 w-full shadow-sm">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
            M<span className="text-primary">-</span>Lila
          </span>
        </Link>

        {/* Integrated Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg group-focus-within:bg-primary/10 transition-all duration-500" />
            <div className="relative bg-slate-100 dark:bg-slate-900 border border-transparent group-focus-within:border-primary/20 group-focus-within:bg-white dark:group-focus-within:bg-slate-950 transition-all duration-300 rounded-full h-11 flex items-center shadow-inner">
              <Search className="ms-4 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t('controls.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ms-auto">
          <LanguageToggle />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserDropdown />
            </>
          ) : (
            <Button asChild className="rounded-full px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      {/* 2. Horizontal Sticky Category Bar */}
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

      {/* 3. Main Content Feed */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-6 lg:px-14 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              Available <span className="text-primary">Parts</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
              {sortedRequests.length} results matching your search criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Button
                variant="outline"
                onClick={() => setSortOption(sortOption === 'newest' ? 'urgency' : 'newest')}
                className="h-11 px-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-2 font-bold text-xs uppercase tracking-widest"
              >
                Sort by: {sortOption === 'newest' ? 'Newest' : 'Urgency'}
             </Button>
          </div>
        </div>

        <MarketplaceFeed
          requests={sortedRequests}
          isLoading={isLoadingReqs}
          userId={user?.id}
          isAuthenticated={isAuthenticated}
          onQuote={(req) => {
            if (!isAuthenticated) {
              navigate({ to: '/login' });
              return;
            }
            setSelectedRequest(req);
          }}
          onClearFilters={handleResetFilters}
        />

        {/* Pagination Controls */}
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

      {/* Shared Dialogs & Footer */}
      <SendOfferDialog
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        user={user}
      />

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-16 mt-20">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">M-Lila Marketplace</span>
            </div>
            <p className="text-slate-400 text-xs font-medium max-w-xs leading-relaxed">
              Global B2B ecosystem for professional mechanical sourcing and industrial part management.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-10">
              <Link to="/" className="hover:text-primary transition-colors">Safety</Link>
              <Link to="/" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} M-Lila Tech.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

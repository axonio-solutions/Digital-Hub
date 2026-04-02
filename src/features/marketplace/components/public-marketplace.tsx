'use client'
// Triggering reload...

import { useEffect, useState, useMemo, createContext, useContext } from "react";
import { Search, Grid3X3, List, Filter, ArrowRight, FileText, Clock, Settings, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfinitePublicOpenRequests, usePublicTaxonomy } from "@/features/requests/hooks/use-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { Link, useRouter } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

const conditionOptions = [
  { id: "new", label: "New (OEM/Aftermarket)" },
  { id: "used", label: "Used / Salvage" },
  { id: "refurbished", label: "Refurbished" }
];

export type TaxonomyData = {
  categories: { id: string; name: string }[];
  brands: { id: string; brand: string }[];
};

type ExploreStore = {
  taxonomyData?: TaxonomyData;
  filteredProducts: any[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceRange: number[];
  setPriceRange: (val: number[]) => void;
  selectedBrands: string[];
  toggleBrand: (id: string) => void;
  selectedConditions: string[];
  toggleCondition: (id: string) => void;
  urgency: string;
  setUrgency: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
};

const ExploreContext = createContext<ExploreStore | null>(null);
const useExploreStoreContext = () => {
  const ctx = useContext(ExploreContext)
  if (!ctx) throw new Error("Missing ExploreContext")
  return ctx
}


// Filter component for reuse in both desktop and mobile
function FilterSection() {
  const {
    taxonomyData,
    selectedBrands,
    selectedConditions,
    urgency,
    selectedCategory,
    toggleBrand,
    toggleCondition,
    setUrgency,
    setSelectedCategory
  } = useExploreStoreContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Part Categories</h3>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="category-all" />
              <Label htmlFor="category-all" className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-300">
                All Categories
              </Label>
            </div>
            {taxonomyData?.categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-300">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Vehicle Brands</h3>
        <div className="max-h-48 space-y-3 overflow-y-auto pe-2 scrollbar-thin scrollbar-thumb-slate-200">
          {taxonomyData?.brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              />
              <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-300">
                {brand.brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Conditions */}
      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Condition Pref.</h3>
        <div className="grid grid-cols-1 gap-2">
          {conditionOptions.map((cond) => (
            <div key={cond.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cond-${cond.id}`}
                checked={selectedConditions.includes(cond.id)}
                onCheckedChange={() => toggleCondition(cond.id)}
              />
              <Label htmlFor={`cond-${cond.id}`} className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-300">
                {cond.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Urgency */}
      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Urgency</h3>
        <RadioGroup value={urgency} onValueChange={setUrgency}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="urgency-any" />
            <Label htmlFor="urgency-any" className="text-sm font-normal text-slate-600 dark:text-slate-300">
              Any time
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="urgency-high" />
            <Label htmlFor="urgency-high" className="text-sm font-normal text-slate-600 dark:text-slate-300">
              ASAP (Vehicle is down)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="urgency-medium" />
            <Label htmlFor="urgency-medium" className="text-sm font-normal text-slate-600 dark:text-slate-300">
              Within a week
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export function PublicMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid" as "grid" | "list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: taxonomyData } = usePublicTaxonomy();
  const router = useRouter();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingReqs,
  } = useInfinitePublicOpenRequests({
    categoryId: selectedCategory,
    brandIds: selectedBrands,
    search: searchQuery,
    limit: 12,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allRequests = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }
  const toggleCondition = (id: string) => {
    setSelectedConditions(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  const store: ExploreStore = {
    taxonomyData: taxonomyData as TaxonomyData | undefined,
    filteredProducts: allRequests,
    selectedCategory, setSelectedCategory,
    priceRange, setPriceRange,
    selectedBrands, toggleBrand,
    selectedConditions, toggleCondition,
    urgency, setUrgency,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
  };

  // Skeleton Card
  const RequestSkeleton = () => (
    <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="relative h-48 sm:h-80 w-full rounded-t-[inherit]">
        <Skeleton className="w-full h-full" />
        <Skeleton className="absolute top-4 start-4 h-6 w-24 rounded-full" />
        <Skeleton className="absolute top-4 end-4 h-6 w-16 rounded-full" />
      </div>
      <CardContent className="p-6 flex flex-col flex-1 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto pt-8 border-t flex items-center">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ExploreContext.Provider value={store}>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Public Header */}
        <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-white relative z-10 w-full shadow-sm">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tighter text-slate-900">
                MLILA
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link to="/" hash="how-it-works" className="hover:text-blue-600 transition-colors">
              How it Works
            </Link>
            <Link to="/" hash="benefits" className="hover:text-blue-600 transition-colors">
              Benefits
            </Link>
            <Link to="/explore" className="text-blue-600 font-bold underline decoration-2 underline-offset-4">
              Explore
            </Link>
            <Link to="/" hash="faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="hidden sm:inline-flex border-slate-300 font-semibold"
              >
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 w-full bg-slate-50/50 dark:bg-slate-950/20 px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row max-w-[1400px] mx-auto">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-64 lg:block shrink-0">
            <div className="sticky top-24">
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Controls Bar */}
            <div className="mb-4 flex flex-col gap-4 sm:mb-6">
              
            <div className="mb-2 flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700 border-none transition-all px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
                <Sparkle className="w-3 h-3 me-1.5 fill-blue-600" />
                Live Demand Feedback
              </Badge>
            </div>
            <div className="mb-2">
              <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white mb-2 tracking-tighter">Demand Signals</h1>
              <p className="text-sm font-medium text-slate-500 italic max-w-lg">Discover active buyer requests across our network. Provide the exact part they are looking for.</p>
            </div>

              {/* Top row - Mobile filter button and product count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 lg:hidden shadow-sm">
                        <Filter className="me-2 h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 sm:w-96">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-full pe-4">
                        <div className="py-4">
                          <FilterSection />
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    {allRequests.length} Requests
                  </div>
                </div>

                <div className="hidden sm:block">
                  <ToggleGroup 
                    type="single" 
                    value={viewMode} 
                    onValueChange={(val: string) => {
                      if (val) setViewMode(val as "grid" | "list")
                    }} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5"
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view" className="rounded-md data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800">
                      <Grid3X3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view" className="rounded-md data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {/* Bottom row - Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="text-slate-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search by part name, brand, or OEM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full ps-10 sm:w-[350px] bg-white dark:bg-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoadingReqs ? (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}>
                {[...Array(6)].map((_, i) => (
                  <RequestSkeleton key={i} />
                ))}
              </div>
            ) : allRequests.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
                <FileText className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-900 dark:text-white font-bold text-xl">
                  No requests found matching your filters.
                </p>
                <p className="text-slate-500 mt-2 text-sm">
                  Try adjusting your search criteria or removing some filters.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                  {allRequests.map((request: any) => (
                    <Card 
                      key={request.id} 
                      className="group p-0 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col h-full ring-0 outline-none"
                    >
                      {/* Image Section (Flush with top, no gap) */}
                      <div className="relative h-48 sm:h-80 w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden m-0 rounded-t-[inherit]">
                        {request.imageUrls?.[0] ? (
                          <img
                            src={request.imageUrls[0]}
                            alt={request.partName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                            <FileText className="size-16 opacity-20" />
                          </div>
                        )}

                        <div className="absolute top-4 start-4 flex flex-col gap-2">
                           <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase shadow-lg px-2 py-1">
                             Looking for Part
                           </Badge>
                          {request.quotes?.length > 0 && (
                            <Badge className="bg-orange-500 text-white border-none font-black text-[10px] uppercase shadow-lg px-2 py-1">
                              Offers Received
                            </Badge>
                          )}
                        </div>

                        {/* Quotes Count Badge on Image */}
                        <div className="absolute top-4 end-4">
                           <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[10px] uppercase shadow-lg px-3 py-1 flex items-center gap-1.5 rounded-full">
                             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                             {request.quotes?.length || 0} Quotes
                           </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <CardContent className="p-6 flex flex-col flex-1">
                        {/* Title & Category Row */}
                        <div className="flex flex-col gap-1 mb-6">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 italic">
                              {request.partName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                               <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 py-0.5 h-auto px-2 rounded-md bg-slate-50/50">
                                 {request.brand?.brand || request.vehicleBrand}
                               </Badge>
                               <Badge variant="secondary" className="bg-slate-100/50 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-none px-2 py-0.5 rounded-md">
                                 {request.category?.name || 'Part'}
                               </Badge>
                               {request.modelYear && (
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   FY {request.modelYear}
                                 </span>
                               )}
                               <span className="text-slate-300 mx-1">•</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                 <Clock className="size-3" />
                                 {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                               </span>
                            </div>
                        </div>

                        {/* Description / Notes */}
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium line-clamp-2 italic leading-relaxed">
                          {request.notes || `Requesting ${request.partName} for ${request.brand?.brand || request.vehicleBrand} ${request.modelYear}.`}
                        </p>

                        {/* Footer Actions */}
                        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/50 flex items-center">
                          <Button 
                            className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl px-7 h-11 flex items-center gap-2.5 shadow-sm hover:bg-primary hover:text-white transition-all transform active:scale-95 translate-y-0 hover:-translate-y-1 w-full"
                            onClick={() => {
                              router.navigate({
                                to: "/login",
                                search: { redirectTo: `/dashboard/requests/${request.id}` }
                              })
                            }}
                          >
                            <span>Sign In to Quote</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Loading Trigger for Infinite Scroll */}
                <div ref={ref} className="h-10 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <div className="flex gap-4 w-full">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="flex-1">
                           <Skeleton className="h-64 w-full rounded-2xl" />
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
        
        {/* Public Footer */}
        <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 rounded-lg p-1.5 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                MLILA
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              © 2026 MLILA Reverse-Marketplace Algeria. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ExploreContext.Provider>
  );
}



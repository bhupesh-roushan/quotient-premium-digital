"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Sparkles, Star, SlidersHorizontal, X, TrendingUp, Clock, ChevronDown } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  slug: string;
  coverUrl: string | null;
  allImageUrls: string[];
  description?: string;
  category?: string;
  tags?: string[];
  stats?: {
    averageRating?: number;
    reviewCount?: number;
    viewCount?: number;
    soldCount?: number;
  };
  createdAt?: string;
};

type SortOption = "newest" | "popularity" | "rating" | "price-asc" | "price-desc";

const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 – ₹500", min: 100, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000+", min: 1000, max: Infinity },
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "newest", label: "Newest", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "popularity", label: "Most Popular", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: "rating", label: "Top Rated", icon: <Star className="w-3.5 h-3.5" /> },
  { value: "price-asc", label: "Price: Low to High", icon: null },
  { value: "price-desc", label: "Price: High to Low", icon: null },
];

interface DiscoverClientProps {
  products: Product[];
  purchasedProductIds: string[];
}

/**
 * Client-side discover page for buyers.
 * Receives all published products from the server and handles:
 * - Full-text search across title, description and tags
 * - Category and price-range filtering
 * - Sorting by newest / popularity / rating / price
 * - Highlights already-purchased products with a badge
 *
 * @param products - All published products fetched server-side
 * @param purchasedProductIds - IDs of products the current user already owns
 */
export default function DiscoverClient({ products, purchasedProductIds }: DiscoverClientProps) {
  const purchasedSet = useMemo(() => new Set(purchasedProductIds), [purchasedProductIds]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index into PRICE_RANGES
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /** Derives a sorted, deduplicated list of category strings from all products. */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    return cats.sort();
  }, [products]);

  /** Applies active search, category, price-range, and sort filters to the product list. */
  const filtered = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPriceRange];
    const q = search.toLowerCase().trim();

    let result = products.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q)) ||
        (p.category?.toLowerCase().includes(q)) ||
        (p.tags?.some((t) => t.toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      const matchesPrice =
        p.price >= priceRange.min && p.price < (priceRange.max === Infinity ? Infinity : priceRange.max + 1);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "popularity":
          return ((b.stats?.soldCount || 0) + (b.stats?.viewCount || 0)) -
                 ((a.stats?.soldCount || 0) + (a.stats?.viewCount || 0));
        case "rating":
          return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return result;
  }, [products, search, selectedCategory, selectedPriceRange, sortBy]);

  const hasActiveFilters =
    search || selectedCategory !== "all" || selectedPriceRange !== 0 || sortBy !== "newest";

  /** Resets all filters and sort back to their default values. */
  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPriceRange(0);
    setSortBy("newest");
  };

  const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy)!;

  return (
    <div className="space-y-6">
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates, categories, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="h-11 px-4 flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-xl text-sm text-white hover:border-neutral-700 transition-all whitespace-nowrap"
          >
            {currentSort.icon}
            <span>{currentSort.label}</span>
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-neutral-950 border border-neutral-800 rounded-xl z-50 overflow-hidden shadow-xl shadow-black/50">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-2.5 text-sm text-left transition-colors hover:bg-neutral-900 ${
                    sortBy === opt.value ? "text-violet-400 bg-violet-500/10" : "text-neutral-300"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters:
        </div>

        {/* Category filters */}
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedCategory === "all"
              ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
              : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
              selectedCategory === cat
                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            {cat.replace(/-/g, " ")}
          </button>
        ))}

        {/* Price range */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-neutral-500">Price:</span>
          {PRICE_RANGES.map((range, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPriceRange(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedPriceRange === idx
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                  : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-neutral-500">
        {filtered.length} {filtered.length === 1 ? "product" : "products"} found
        {hasActiveFilters && (
          <span className="ml-1 text-neutral-600">
            (filtered from {products.length} total)
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-white font-medium mb-1">No products found</p>
          <p className="text-neutral-500 text-sm">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/10 transition-all"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => {
            const isPurchased = purchasedSet.has(p._id);
            return (
              <div
                key={p._id}
                className="group relative rounded-2xl border border-neutral-800/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-2 hover:border-violet-500/30 bg-neutral-900/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-pink-600/0 to-violet-600/0 group-hover:from-violet-600/10 group-hover:via-pink-600/5 group-hover:to-violet-600/10 transition-all duration-500 opacity-0 group-hover:opacity-100" />

                <Link href={`/discover/${p.slug}`} className="block relative z-10 p-3">
                  <div className="relative w-full aspect-4/3 bg-neutral-900 overflow-hidden rounded-xl">
                    {p.allImageUrls && p.allImageUrls.length > 0 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={p.coverUrl || p.allImageUrls[0]}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {p.allImageUrls.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium border border-white/20 shadow-lg">
                            +{p.allImageUrls.length - 1} more
                          </div>
                        )}

                        {p.allImageUrls.length > 1 && (
                          <div className="absolute bottom-3 left-3 flex gap-1.5">
                            {p.allImageUrls.slice(1, 3).map((url: string, index: number) => (
                              <img
                                key={index}
                                src={url}
                                alt={`${p.title} ${index + 2}`}
                                loading="lazy"
                                className="w-8 h-8 object-cover rounded-lg border-2 border-white/40 shadow-md transition-transform duration-300 group-hover:scale-110"
                              />
                            ))}
                            {p.allImageUrls.length > 3 && (
                              <div className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-lg border-2 border-white/40 flex items-center justify-center shadow-md">
                                <span className="text-white text-xs font-medium">+{p.allImageUrls.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="absolute top-3 left-3">
                          {isPurchased ? (
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-white rounded-full" />
                              Owned
                            </div>
                          ) : (
                            <div className="bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm text-violet-400 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg shadow-violet-500/20 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              Premium
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium text-sm border border-white/30 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            Quick View
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-800/80 flex items-center justify-center border border-neutral-700">
                            <Sparkles className="w-8 h-8 text-neutral-500" />
                          </div>
                          <div className="text-neutral-500 text-sm font-medium">No Preview</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5 space-y-4 relative z-10">
                  {p.category && (
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setSelectedCategory(p.category!)}
                        className="inline-block px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full capitalize hover:bg-violet-500/20 transition-colors"
                      >
                        {p.category.replace(/-/g, " ")}
                      </button>
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {p.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-block px-2 py-0.5 bg-neutral-800/50 text-neutral-400 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {p.tags.length > 2 && (
                            <span className="inline-block px-2 py-0.5 bg-neutral-800/50 text-neutral-500 text-xs rounded-full">
                              +{p.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Link href={`/discover/${p.slug}`} className="block group/title">
                      <h3 className="text-lg font-semibold leading-tight text-white group-hover/title:text-violet-300 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                    </Link>
                    {p.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2 mt-2">{p.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        {(p.stats?.averageRating ?? 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.round(p.stats?.averageRating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-transparent text-neutral-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-neutral-400 text-xs">
                              {(p.stats?.averageRating || 0).toFixed(1)} ({p.stats?.reviewCount || 0})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          {(p.stats?.viewCount ?? 0) > 0 && <span>{p.stats!.viewCount} views</span>}
                          {(p.stats?.soldCount ?? 0) > 0 && <span>{p.stats!.soldCount} sold</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Price</span>
                      <span className="text-emerald-400 font-bold text-xl">₹{p.price}</span>
                    </div>
                    {isPurchased && (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        Purchased
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

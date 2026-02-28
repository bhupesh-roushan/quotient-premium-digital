import { HoverBorderGradientDemoSmall } from "@/components/accertainity/sellingbuttonsmall";
import BuyerSell from "@/components/buyer/common/buyer-shell";
import { apiServerGet } from "@/lib/api/server";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Search, Sparkles, Star } from "lucide-react";
import { LibraryRes } from "../library/page";


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

type ProductRes = { ok: boolean; products: Product[] };



async function BuyerDiscoverPage() {
  const data = await apiServerGet<ProductRes>("/api/products");
  const products = data?.products ?? [];
  
  // Get library items to check purchased products (handle 401 for non-logged in users)
  let purchasedProductIds = new Set<string>();
  try {
    const libraryResponse = await apiServerGet<LibraryRes>("/api/library");
    const libraryItems = libraryResponse.items ?? [];
    purchasedProductIds = new Set(libraryItems.map((item: { productId: string }) => item.productId));
  } catch {
    // User not logged in or other error - continue with empty set
    purchasedProductIds = new Set<string>();
  }

  return (
    <BuyerSell>
      <div className="relative min-h-screen bg-neutral-950">
        <BackgroundBeams className="fixed inset-0 z-0" />
        
        <div className="relative z-10">
          <header className="px-4 py-8 md:px-8 lg:px-[8vw]">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                  Discover
                </h1>
                <p className="text-neutral-400 mt-1">
                  Browse premium templates and digital products from creators
                </p>
              </div>
            </div>
          </header>

          <main className="px-4 pb-10 md:px-8 lg:px-[8vw]">

        {!products.length ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400">No published templates yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const isPurchased = purchasedProductIds.has(p._id);
                
                return (
                <div
                  key={p._id}
                  className="group relative rounded-2xl border border-neutral-800/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-2 hover:border-violet-500/30 bg-neutral-900/50 backdrop-blur-sm"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-pink-600/0 to-violet-600/0 group-hover:from-violet-600/10 group-hover:via-pink-600/5 group-hover:to-violet-600/10 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  
                  <Link href={`/discover/${p.slug}`} className="block relative z-10 p-3">
                    <div className="relative w-full aspect-4/3 bg-neutral-900 overflow-hidden rounded-xl">
                      {p.allImageUrls && p.allImageUrls.length > 0 ? (
                        <div className="relative w-full h-full">
                          {/* Main Image with zoom */}
                          <img
                            src={p.coverUrl || p.allImageUrls[0]}
                            alt={p.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* More images badge */}
                          {p.allImageUrls.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium border border-white/20 shadow-lg">
                              +{p.allImageUrls.length - 1} more
                            </div>
                          )}
                          
                          {/* Thumbnail previews */}
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
                          
                          {/* Premium badge */}
                          <div className="absolute top-3 left-3">
                            {isPurchased ? (
                              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                Owned
                              </div>
                            ) : (
                              <div className="bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm text-violet-400 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg shadow-violet-500/20 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                Premium
                              </div>
                            )}
                          </div>
                          
                          {/* Quick view button on hover */}
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

                  {/* Card Content */}
                  <div className="p-5 space-y-4 relative z-10">
                    {/* Category Badge */}
                    {p.category && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full capitalize">
                          {p.category.replace(/-/g, ' ')}
                        </span>
                        {/* Tags */}
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
                    
                    {/* Title */}
                    <div>
                      <Link href={`/discover/${p.slug}`} className="block group/title">
                        <h3 className="text-lg font-semibold leading-tight text-white group-hover:text-violet-300 transition-colors line-clamp-2 group-hover/title:text-violet-300">
                          {p.title}
                        </h3>
                      </Link>
                      
                      {/* Description */}
                      {p.description && (
                        <p className="text-sm text-neutral-400 line-clamp-2 mt-2">
                          {p.description}
                        </p>
                      )}
                       
                      {/* Rating and Stats */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          {/* Rating */}
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
                          
                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                            {p.stats?.viewCount && (
                              <span>{p.stats.viewCount} views</span>
                            )}
                            {p.stats?.soldCount && (
                              <span>{p.stats.soldCount} sold</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-500">Price</span>
                        <span className="text-emerald-400 font-bold text-xl">
                          ₹{p.price}
                        </span>
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
          </div>
        )}
          </main>
        </div>
      </div>
    </BuyerSell>
  );

}


export default BuyerDiscoverPage;


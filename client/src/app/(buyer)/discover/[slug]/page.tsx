import BuyerSell from "@/components/buyer/common/buyer-shell";
import BuyNewButton from "@/components/buyer/discover/buy-new-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiServerGet } from "@/lib/api/server";
import { getMe } from "@/lib/auth/getMe";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LibraryRes, LibraryItem } from "../../library/page";
import { ProductImageCarousel } from "./product-image-carousel";
import { BuyerAIInsights } from "./buyer-ai-insights";
import CodeTemplatePreview from "@/components/ui/code-template-preview";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Package, Sparkles, Calendar, Eye, ShoppingCart, Star } from "lucide-react";
import { ReviewSection } from "@/components/reviews/review-section";

type ProductDetailRes = {
  ok: boolean;
  product?: {
    _id: string;
    creatorId: string;
    title: string;
    description: string;
    price: number;
    currency: "INR";
    slug: string;
    coverUrl: string | null;
    allImageUrls: string[];
    category?: string;
    features?: string[];
    deliverables?: any[];
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    stats?: {
      viewCount: number;
      soldCount: number;
      revenue: number;
      averageRating: number;
      reviewCount: number;
      conversionRate: number;
    };
    codeTemplate?: {
      framework: string;
      language: string;
      componentType: string;
      dependencies: string[];
      hasLivePreview: boolean;
      sandboxEnabled: boolean;
      codeFiles: Array<{
        filename: string;
        content: string;
        language: string;
      }>;
    };
  };
  error?: string;
};

function formatDate(input: string | null) {
  if (!input) return "-";

  return new Date(input).toLocaleDateString();
}

export default async function DiscoverDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const me = await getMe();

  const data = await apiServerGet<ProductDetailRes>(`/api/products/${slug}`);

  // Get library items to check purchased status (handle 401 for non-logged in users)
  let libraryItems: LibraryItem[] = [];
  try {
    const getLibraryResponse = await apiServerGet<LibraryRes>("/api/library");
    libraryItems = getLibraryResponse.items ?? [];
  } catch {
    // User not logged in - continue with empty library
    libraryItems = [];
  }

  if (!data.ok || !data.product) redirect("/discover");

  const productInfo = data.product;
  const coverUrl = productInfo.coverUrl;

  const isOwner = me.ok && me.user && me.user.id === productInfo.creatorId;

  return (
    <BuyerSell>
      <div className="relative min-h-screen bg-neutral-950">
        <BackgroundBeams className="fixed inset-0 z-0" />
        
        <div className="relative z-10 pt-20 pb-8">
          <div className="h-full px-4 lg:px-[8vw] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                    {productInfo.title}
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    Premium digital product by creator
                  </p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-8">
              {/* Left Side: Images + Details */}
              <div className="space-y-6">
                {/* Image Section */}
                <div className="rounded-2xl border border-neutral-800/50 overflow-hidden shadow-xl shadow-violet-500/10 bg-neutral-900/50 backdrop-blur-sm">
                  <div className="relative aspect-[4/3] bg-neutral-900">
                    <ProductImageCarousel 
                      images={productInfo.allImageUrls || []} 
                      title={productInfo.title} 
                    />
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="rounded-2xl border border-neutral-800/50 p-6 bg-neutral-900/50 backdrop-blur-sm space-y-4">
                  {/* Title and Basic Info */}
                  <div className="space-y-4">
                    {productInfo?.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Description
                        </h3>
                        <p className="text-sm lg:text-base text-neutral-300 leading-relaxed">
                          {productInfo.description}
                        </p>
                      </div>
                    )}

                    {/* Category and Tags */}
                    <div className="flex flex-wrap gap-2">
                      {productInfo?.category && (
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-pink-600/20 text-violet-300 text-xs font-medium border border-violet-500/30">
                          {productInfo.category}
                        </div>
                      )}
                      {productInfo?.tags?.map((tag, index) => (
                        <div key={index} className="px-3 py-1.5 rounded-full bg-neutral-800/50 text-neutral-400 text-xs border border-neutral-700/50">
                          {tag}
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    {productInfo?.features && productInfo.features.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800">
                        <h3 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Key Features
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {productInfo.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800/30 rounded-lg px-3 py-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Stats */}
                    {productInfo?.stats && (
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800">
                        <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-700/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="w-4 h-4 text-violet-400" />
                            <span className="text-lg font-bold text-white">{productInfo.stats.viewCount}</span>
                          </div>
                          <div className="text-xs text-neutral-400">Views</div>
                        </div>
                        <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-700/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <ShoppingCart className="w-4 h-4 text-emerald-400" />
                            <span className="text-lg font-bold text-white">{productInfo.stats.soldCount}</span>
                          </div>
                          <div className="text-xs text-neutral-400">Sales</div>
                        </div>
                        <div className="bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-700/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-lg font-bold text-white">
                              {productInfo.stats.averageRating > 0 ? productInfo.stats.averageRating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400">Rating</div>
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    {productInfo?.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2">
                        <Calendar className="w-3 h-3" />
                        Created on {new Date(productInfo.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Pricing + AI Insights */}
              <div className="space-y-6">
                {/* Pricing Section - At Top */}
                <div className="rounded-2xl border border-neutral-800/50 p-6 bg-neutral-900/50 backdrop-blur-sm shadow-xl shadow-violet-500/10">
                  <div className="flex items-end justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">Price</div>
                      <div className="text-3xl font-bold leading-none bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        ₹{productInfo.price}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-medium">
                      Premium
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {!me.ok ? (
                      <Button asChild className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all">
                        <Link href="/login">Login To Buy</Link>
                      </Button>
                    ) : isOwner ? (
                      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-neutral-400 text-center">
                        You can&apos;t buy your own template
                      </div>
                    ) : libraryItems.filter(
                        (item) => item.productId === productInfo._id
                      ).length ? (
                      <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer">
                        Purchased {formatDate(
                          libraryItems.find(
                            (item) => item.productId === productInfo._id
                          )?.paidAt || null
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <BuyNewButton productId={productInfo._id} />
                        <Button asChild variant="outline" className="w-full h-12 rounded-xl border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700 text-white">
                          <Link href={`/discover/${slug}/images`}>
                            View All Images
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Preview for Code Templates */}
                {productInfo.codeTemplate && (
                  <div className="rounded-2xl border border-neutral-800/50 overflow-hidden shadow-xl shadow-violet-500/10 bg-neutral-900/50 backdrop-blur-sm">
                    <CodeTemplatePreview 
                      template={productInfo.codeTemplate}
                      isPurchased={libraryItems.some(item => item.productId === productInfo._id)}
                    />
                  </div>
                )}

                {/* AI Insights - Below Pricing */}
                <div className="max-h-[50vh] overflow-hidden rounded-2xl border border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm">
                  <BuyerAIInsights product={productInfo} />
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Reviews & Ratings
                  </h2>
                  <ReviewSection
                    productId={productInfo._id}
                    userId={me.ok && me.user ? me.user.id : undefined}
                    isLoggedIn={me.ok}
                    hasPurchased={libraryItems.some(item => item.productId === productInfo._id)}
                    isOwner={isOwner}
                    averageRating={productInfo.stats?.averageRating || 0}
                    reviewCount={productInfo.stats?.reviewCount || 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerSell>
  );
}

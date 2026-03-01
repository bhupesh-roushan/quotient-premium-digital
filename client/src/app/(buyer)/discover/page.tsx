import BuyerSell from "@/components/buyer/common/buyer-shell";
import { apiServerGet } from "@/lib/api/server";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Search } from "lucide-react";
import { LibraryRes } from "../library/page";
import DiscoverClient from "@/components/buyer/discover/discover-client";


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
            <DiscoverClient
              products={products}
              purchasedProductIds={Array.from(purchasedProductIds)}
            />
          </main>
        </div>
      </div>
    </BuyerSell>
  );

}


export default BuyerDiscoverPage;


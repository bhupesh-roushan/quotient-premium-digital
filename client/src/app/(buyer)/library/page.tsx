import BuyerSell from "@/components/buyer/common/buyer-shell";
import LibraryClient from "@/components/buyer/library/library-client";
import { apiServerGet } from "@/lib/api/server";
import { getMe } from "@/lib/auth/getMe";
import { redirect } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Library, Sparkles } from "lucide-react";

export type LibraryItem = {
  productId: string;
  title: string;
  price: number;
  currency: "INR";
  paidAt: string | null;
  coverImageUrl?: string;
  description?: string;
  category?: string;
  visibility?: string;
  stats?: {
    viewCount: number;
    soldCount: number;
    revenue: number;
    averageRating: number;
    reviewCount: number;
    conversionRate: number;
  };
};

export type LibraryRes = { ok: boolean; items: LibraryItem[]; error?: string };

async function LibraryPage() {
  const me = await getMe();
  if (!me.ok) redirect("/login");
  const data = await apiServerGet<LibraryRes>("/api/library");
  const items = data.items ?? [];

  return (
    <BuyerSell>
      <div className="relative min-h-screen bg-neutral-950">
        <BackgroundBeams className="fixed inset-0 z-0" />
        
        <div className="relative z-10">
          <header className="px-4 py-8 md:px-8 lg:px-[8vw]">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                  Your Library
                </h1>
                <p className="text-neutral-400 mt-1">
                  Access your purchased templates and digital products
                </p>
              </div>
            </div>
          </header>
          
          <main className="px-4 pb-10 md:px-8 lg:px-[8vw]">
            <LibraryClient items={items} />
          </main>
        </div>
      </div>
    </BuyerSell>
  );
}

export default LibraryPage;

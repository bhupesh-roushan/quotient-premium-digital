import { apiServerGet } from "@/lib/api/server";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HoverBorderGradientDemoSmall } from "@/components/accertainity/sellingbuttonsmall";
import { HoverBorderGradientDemo } from "@/components/accertainity/sellingbutton";
import Image from "next/image";

type ProductResponse = {
  ok: boolean;
  products: Array<{
    _id: string;
    title: string;
    price: number;
    visibility: string;
    description?: string;
    stats: { assetCount: number };
    previewImages?: Array<{
      url: string;
      _id: string;
    }>;
  }>;
};

async function CreatorProductListPage() {
  const data = await apiServerGet<ProductResponse>("/api/creator/products");
  const products = data.products ?? [];

  return (
    <div className="relative min-h-screen bg-neutral-950">
      <BackgroundBeams className="fixed inset-0 z-0" />
      {/* Important: relative + z-10 so content stays above beams */}
      <div className="relative z-10 min-h-screen p-6 lg:p-8 text-white">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>

          <Link
            href="/dashboard/products/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white transition-all bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm hover:bg-violet-500/20"
          >
            + New Template
          </Link>
        </header>

        {/* BODY */}
        {!products.length ? (
          <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm p-6">
            <p className="text-sm text-neutral-400">No templates yet</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p._id}
                className="rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-1 p-6"
              >
                <Link href={`/dashboard/products/${p._id}`}>
                  <div className="space-y-4">
                    {/* Cover Image */}
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-900/50 mb-4">
                      {p.previewImages && p.previewImages.length > 0 ? (
                        <Image
                          src={p.previewImages[0].url}
                          alt={`${p.title} cover`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-neutral-500 text-sm">No Preview</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="truncate text-base font-semibold text-white">
                        {p.title}
                      </h3>
                      
                      {/* Short Description */}
                      {p.description && (
                        <p className="text-sm text-neutral-400 line-clamp-2">
                          {p.description.length > 100 
                            ? `${p.description.substring(0, 100)}...` 
                            : p.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-400">
                          INR {p.price}
                        </span>
                        <span className="text-sm text-neutral-400 whitespace-nowrap">
                          {p.stats.assetCount} preview assets
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-neutral-500 font-mono">
                    {p._id.slice(-6)}
                  </span>

                  <Link
                    href={`/dashboard/products/${p._id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-all bg-neutral-800/50 border border-neutral-700 backdrop-blur-sm hover:bg-neutral-700/50 hover:border-neutral-600"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatorProductListPage;

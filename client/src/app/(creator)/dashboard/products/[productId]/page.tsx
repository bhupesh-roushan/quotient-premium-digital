import ProductEditor from "@/components/creator/dashboard/products/product-editor/product-editor";
import { apiServerGet } from "@/lib/api/server";
import { AssetsRes, ProductRes } from "@/lib/types/product";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";

async function ProductEditorPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  try {
    const [productResponse, assetResponse] = await Promise.all([
      apiServerGet<ProductRes>(`/api/creator/products/${productId}`),
      apiServerGet<AssetsRes>(`/api/creator/products/${productId}/assets`),
    ]);

    if (!productResponse.ok) {
      console.log("Product not found, redirecting to products list");
      redirect("/dashboard/products");
    }

    return (
      <div className="relative min-h-screen bg-neutral-950">
        {/* Background covers entire page */}
        <BackgroundBeams className="fixed inset-0 z-0" />
        
        <div className="relative z-10">
          <header className="flex flex-col gap-4 p-4 md:p-8 mb-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/products"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">Back to Products</span>
                </Link>
                <h1 className="line-clamp-2 hidden text-2xl font-semibold sm:block text-white">
                  Edit Template
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 lg:px-8">
            <ProductEditor
              productId={productId}
              initialProduct={productResponse.product}
              initialAssets={assetResponse.ok ? assetResponse.assets : []}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    redirect("/dashboard/products");
  }
}

export default ProductEditorPage;
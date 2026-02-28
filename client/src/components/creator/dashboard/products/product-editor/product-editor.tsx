"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AssetsRes,
  ImageAsset,
  Product,
  ProductRes,
} from "@/lib/types/product";
import EditPanelRedesigned from "./edit-panel-redesigned";
import ImportPanel from "./import-panel";
import { useCallback, useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";

function ProductEditor({
  productId,
  initialProduct,
  initialAssets,
}: {
  productId: string;
  initialProduct: Product;
  initialAssets: ImageAsset[];
}) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [assets, setAssets] = useState<ImageAsset[]>(initialAssets);

  const coverUrl = useMemo(() => {
    const cover = assets.find(
      (a) => String(a._id) === String(product.coverImageAssetId)
    );
    return cover?.cloudinary?.secureUrl ?? null;
  }, [assets, product.coverImageAssetId]);

  const refreshAll = useCallback(async () => {
    const [p, a] = await Promise.all([
      apiClient.get<ProductRes>(`/api/creator/products/${productId}`),
      apiClient.get<AssetsRes>(`/api/creator/products/${productId}/assets`),
    ]);

    if (p?.data?.ok) setProduct(p.data.product);
    if (a?.data?.ok) setAssets(a.data.assets ?? []);
  }, [productId]);

  return (
    <Tabs defaultValue="edit" className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <TabsList className="w-full sm:w-96 rounded-full border border-neutral-800 p-1 bg-neutral-900/50 backdrop-blur-sm">
          <TabsTrigger
            className="rounded-full data-[state=active]:bg-neutral-800/50 data-[state=active]:backdrop-blur-sm data-[state=active]:border data-[state=active]:border-violet-500/50 data-[state=active]:text-white text-neutral-400 p-3 transition-all hover:text-white"
            value="edit"
          >
            Edit Template
          </TabsTrigger>
          <TabsTrigger
            className="rounded-full data-[state=active]:bg-neutral-800/50 data-[state=active]:backdrop-blur-sm data-[state=active]:border data-[state=active]:border-violet-500/50 data-[state=active]:text-white text-neutral-400 p-3 transition-all hover:text-white"
            value="import"
          >
            Page Builder
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="edit" className="space-y-6">
        <EditPanelRedesigned
          productId={productId}
          product={product}
          assets={assets}
          coverUrl={coverUrl}
          onProductChange={setProduct}
          onAssetsChange={setAssets}
          onRefresh={refreshAll}
        />
      </TabsContent>

      <TabsContent value="import" className="space-y-6">
        <ImportPanel onAfterIngest={refreshAll} productId={productId} />
      </TabsContent>
    </Tabs>
  );
}

export default ProductEditor;

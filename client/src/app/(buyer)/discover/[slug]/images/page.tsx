import BuyerSell from "@/components/buyer/common/buyer-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiServerGet } from "@/lib/api/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type ProductImagesRes = {
  ok: boolean;
  product?: {
    _id: string;
    title: string;
    slug: string;
  };
  images?: Array<{
    _id: string;
    cloudinary: {
      secureUrl: string;
      publicId: string;
    };
    meta: {
      filename: string;
      width: number;
      height: number;
    };
  }>;
  error?: string;
};

export default async function ProductImagesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await apiServerGet<ProductImagesRes>(`/api/products/${slug}/images`);

  if (!data.ok || !data.product) redirect(`/discover/${slug}`);

  const productInfo = data.product;
  const images = data.images || [];

  return (
    <BuyerSell>
      <main className="px-4 lg:px-[8vw] py-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/discover/${slug}`}>
                ← Back to Product
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl leading-none tracking-tight">
              All Images for {productInfo.title}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Browse all preview images for this product
          </p>
        </div>

        {!images.length ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No images available for this product yet.</p>
            <Button asChild className="mt-4">
              <Link href={`/discover/${slug}`}>
                Back to Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card key={image._id} className="overflow-hidden bg-black border border-border">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={image.cloudinary.secureUrl}
                    alt={image.meta.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground truncate">
                    {image.meta.filename}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {image.meta.width} × {image.meta.height}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </BuyerSell>
  );
}
